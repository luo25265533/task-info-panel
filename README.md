# task-info-panel

React 任务信息侧边栏组件：展示 SKU、任务类型、任务等级、产品类型、附件链接，以及按 `custom_tag`（Tabs）和 `label_type` 分组的任务图片。

## 安装

```bash
npm install task-info-panel
# 或
yarn add task-info-panel
# 或
pnpm add task-info-panel
```

## 依赖

- `react`、`react-dom` >= 17（peer）
- 样式使用 **Tailwind CSS** 类名，请确保宿主项目已配置 Tailwind，或自行覆盖样式。

## 使用

```tsx
import { TaskInfoPanel } from 'task-info-panel';

// 固定在左侧（由宿主控制布局）
<TaskInfoPanel className="fixed left-0 top-0 bottom-0" />

// 仅通过 props 传数据，不监听 postMessage
<TaskInfoPanel task={taskData} enablePostMessage={false} />
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `task` | `TaskData` | - | 任务数据，不传则依赖 postMessage 或显示空状态 |
| `enablePostMessage` | `boolean` | `true` | 是否监听 `window.postMessage` 更新任务数据 |
| `className` | `string` | `''` | 根节点额外 class |

### 数据类型

从包内导出：

- `TaskData`：任务完整数据
- `TaskFile`、`ImageValue`、`ImageGroupByType`、`ImagesAssignmentItem`

### postMessage 协议

启用 `enablePostMessage` 时，可向页面发送任务数据，支持以下结构之一：

- `{ payload: Partial<TaskData> }`
- `{ data: Partial<TaskData> }`
- `{ task: Partial<TaskData> }`
- 或直接为 `Partial<TaskData>` 对象

至少包含有效 `sku` 字符串才会更新面板。

## 本地开发 / 构建

```bash
cd task-info-panel
npm install
npm run build
```

发布前请先执行 `npm run build`，发布内容以 `dist` 和 `README.md` 为准。
# task-info-panel
