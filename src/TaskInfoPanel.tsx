import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';

export type TaskFile = { name: string; url?: string };

export type ImageValue = {
  id: number;
  name?: string;
  url: string;
};

export type ImageGroupByType = {
  type: number;
  label_type: string;
  values: ImageValue[];
};

export type ImagesAssignmentItem = {
  custom_tag: string;
  language_id?: number | null;
  language_code?: string | null;
  image_list: ImageGroupByType[];
};

export type TaskData = {
  sku: string;
  task_type_text: string[];
  task_priority_text: string;
  product_type_text: string;
  task_file: TaskFile[];
  images_assignment_list: ImagesAssignmentItem[];
};

export interface TaskInfoPanelProps {
  task?: TaskData;
  /** 是否启用 postMessage 自动监听（默认 true） */
  enablePostMessage?: boolean;
  /** 根节点额外 className */
  className?: string;
}

const EMPTY_TASK: TaskData = {
  sku: '',
  task_type_text: [],
  task_priority_text: '',
  product_type_text: '',
  task_file: [],
  images_assignment_list: [],
};

const isTaskEmpty = (task: TaskData): boolean => {
  return (
    !task.sku &&
    (!task.task_type_text || task.task_type_text.length === 0) &&
    !task.task_priority_text &&
    !task.product_type_text &&
    (!task.task_file || task.task_file.length === 0) &&
    (!task.images_assignment_list || task.images_assignment_list.length === 0)
  );
};

export const TaskInfoPanel: FC<TaskInfoPanelProps> = ({
  task,
  enablePostMessage = true,
  className = '',
}) => {
  const [localTask, setLocalTask] = useState<TaskData>(task ?? EMPTY_TASK);
  const [activeTagIdx, setActiveTagIdx] = useState(0);
  const [previewImage, setPreviewImage] = useState<ImageValue | null>(null);
  const [previewFile, setPreviewFile] = useState<TaskFile | null>(null);
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);
  const panelWidthClass = isInfoCollapsed ? 'w-[64px]' : 'w-[450px]';

  useEffect(() => {
    if (task) setLocalTask(task);
  }, [task]);

  useEffect(() => {
    if (!enablePostMessage) return;

    const handleMessage = (e: MessageEvent) => {
      let data: any = e.data;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;

      const maybePayload =
        (data as any).payload ?? (data as any).data ?? (data as any).task ?? data;

      if (!maybePayload || typeof maybePayload !== 'object') return;

      const next = maybePayload as Partial<TaskData>;
      if (typeof next.sku !== 'string' || !next.sku.trim()) return;

      setLocalTask((prev) => ({
        ...prev,
        ...next,
        task_file: Array.isArray(next.task_file) ? next.task_file : prev.task_file,
        images_assignment_list: Array.isArray(next.images_assignment_list)
          ? next.images_assignment_list
          : prev.images_assignment_list,
        task_type_text: Array.isArray(next.task_type_text)
          ? next.task_type_text
          : prev.task_type_text,
      }));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [enablePostMessage]);

  const firstFile = useMemo(() => localTask.task_file?.[0], [localTask.task_file]);
  const previewFileUrl = previewFile?.url ?? '';
  const previewFileKind = useMemo(() => {
    if (!previewFile?.url) return null;
    const name = previewFile.name ?? '';
    const src = previewFile.url;
    const candidate = (name || src).toLowerCase().split('?')[0].split('#')[0];
    const ext = candidate.includes('.') ? candidate.split('.').pop() ?? '' : '';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office';
    return 'other';
  }, [previewFile]);
  const tagGroups = useMemo(
    () =>
      Array.isArray(localTask.images_assignment_list)
        ? localTask.images_assignment_list
        : [],
    [localTask.images_assignment_list],
  );

  useEffect(() => {
    if (!tagGroups.length) {
      if (activeTagIdx !== 0) setActiveTagIdx(0);
      return;
    }
    if (activeTagIdx >= tagGroups.length) setActiveTagIdx(0);
  }, [tagGroups.length, activeTagIdx]);

  if (isTaskEmpty(localTask)) {
    return null;
  }

  return (
    <div className={`${panelWidthClass} flex-shrink-0 ${className}`.trim()}>
      <div
        className={`fixed inset-y-0 left-0 ${panelWidthClass} border-r border-gray-200 overflow-y-auto p-2 bg-white z-[999]`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 relative">
          <div className="font-semibold text-base">图片任务信息</div>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-700 hover:border-slate-300 absolute right-0 top-0"
            onClick={() => setIsInfoCollapsed((v) => !v)}
          >
            {isInfoCollapsed ? '展开' : '收拢'}
          </button>
        </div>

        {!isInfoCollapsed && (
          <>
            <div className="flex flex-wrap text-sm text-slate-700">
              <div className="mr-4 mb-2">SKU: {localTask.sku}</div>
              <div className="mr-4 mb-2">
                任务类型:
                {localTask.task_type_text?.map((item, idx) => (
                  <span key={idx} className="ml-1">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mr-4 mb-2">任务等级: {localTask.task_priority_text}</div>
              <div className="mr-4 mb-2">产品类型: {localTask.product_type_text}</div>
              <div className="mr-4 mb-2">
                <span>产品要求附件: </span>
                <button
                  type="button"
                  title="产品要求附件"
                  className="w-[180px] truncate text-left text-blue-600 hover:underline"
                  onClick={() => {
                    if (firstFile?.url) setPreviewFile(firstFile);
                  }}
                >
                  {firstFile?.name}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="font-semibold text-sm mb-2">任务图片</div>
              {tagGroups.length ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tagGroups.map((tg, idx) => {
                      const isActive = idx === activeTagIdx;
                      const label = tg.custom_tag || '默认';
                      return (
                        <button
                          key={`${label}-${idx}`}
                          type="button"
                          onClick={() => setActiveTagIdx(idx)}
                          className={`px-3 py-1.5 rounded-full text-base font-semibold border transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                          title={label}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                    <div className="space-y-3">
                      {tagGroups[activeTagIdx]?.image_list?.map((typeGroup, typeIdx) => (
                        <div key={`${typeGroup.type}-${typeIdx}`}>
                          <div className="mb-1">{typeGroup.label_type}</div>
                          <div className="grid grid-cols-4 gap-3 min-h-[180px]">
                            {typeGroup.values?.map((img, imgIdx) => (
                              <div
                                key={img.id ?? imgIdx}
                                className="overflow-hidden cursor-pointer hover:shadow-sm bg-white"
                                onClick={() => setPreviewImage(img)}
                              >
                                <img
                                  src={img.url}
                                  alt={img.name || `image-${imgIdx}`}
                                  className="w-[98px] h-[98px] object-cover"
                                />
                                {img.name && (
                                  <div className="px-2 py-1 text-xs text-slate-600 truncate">
                                    {img.name}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[180px] flex items-center text-xs text-slate-400">
                  暂无任务图片
                </div>
              )}
            </div>
          </>
        )}

        {previewImage && (
          <div
            className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh] bg-black/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-700 shadow flex items-center justify-center text-lg leading-none"
                onClick={() => setPreviewImage(null)}
              >
                ×
              </button>
              <img
                src={previewImage.url}
                alt={previewImage.name || 'preview'}
                className="max-w-[90vw] max-h-[80vh] object-contain"
              />
              {previewImage.name && (
                <div className="mt-2 text-center text-xs text-slate-100">
                  {previewImage.name}
                </div>
              )}
            </div>
          </div>
        )}

        {previewFile && (
          <div
            className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center"
            onClick={() => setPreviewFile(null)}
          >
            <div
              className="relative w-[90vw] h-[85vh] bg-white rounded shadow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-slate-700 shadow flex items-center justify-center text-lg leading-none"
                onClick={() => setPreviewFile(null)}
              >
                ×
              </button>
              {previewFileKind === 'image' && previewFileUrl && (
                <img
                  src={previewFileUrl}
                  alt={previewFile.name || 'attachment'}
                  className="w-full h-full object-contain bg-black/10"
                />
              )}
              {previewFileKind === 'office' && previewFileUrl && (
                <iframe
                  title={previewFile.name || 'attachment'}
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    previewFileUrl,
                  )}`}
                  className="w-full h-full"
                />
              )}
              {previewFileKind === 'pdf' && previewFileUrl && (
                <iframe
                  title={previewFile.name || 'attachment'}
                  src={previewFileUrl}
                  className="w-full h-full"
                />
              )}
              {previewFileKind === 'other' && (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-600">
                  该文件类型暂不支持预览，请点击打开。
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:underline"
                    onClick={() => {
                      if (previewFileUrl) window.open(previewFileUrl, '_blank');
                    }}
                  >
                    打开
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskInfoPanel;
