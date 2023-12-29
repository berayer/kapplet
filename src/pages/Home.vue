<script setup lang="ts">
import kapi from '@/util/VmClient'
import type { ElTree } from 'element-plus'

/** 表格数据类型 */
type TabelData = {
  gt: KJL.ParamModel[]
  mc: KJL.ParamModel[]
  wj: KJL.ParamModel[]
}

// 所有模型展开Map,提高查询指定模型速度
const baseMap = new Map<string, KJL.ParamModel>()
// 表格原始数据,未过滤
const baseTableData: TabelData = { gt: [], mc: [], wj: [] }
/** 表格中当前显示的数据 */
const tableData = ref<TabelData>({ gt: [], mc: [], wj: [] })
// 当前选中的板件key
const currentKey = ref<string>('')
// 当前选中的板件层级树
const levelTreeData = ref<KJL.ParamModel[]>([])
// 当前选中板件的变量树
const variableTreeData = ref<KJL.Parameter[]>([])
// 层级数的实例
const levelTreeRef = ref<InstanceType<typeof ElTree> | null>(null)
// 变量树的实例
const variableTreeRef = ref<InstanceType<typeof ElTree> | null>(null)
// 变量树的过滤词
const variableFilterText = ref('')
// 数据表格的过滤词
const tableFilterText = ref('')

/** 表格选中当前行事件 */
function tableOnSelect(row: KJL.ParamModel) {
  // 变更当前选中的key
  currentKey.value = row.id

  // 设置当前板材的层级树
  levelTreeData.value = getCurrentLevel(row)
  // 设置当前的变量树
  // 设置当前的板件信息

  // 酷家乐选中当前模型
  kapi.send('setSelectModel')(row.id)
}

/** 向上获取模型的层级树 */
function getCurrentLevel(row: KJL.ParamModel): KJL.ParamModel[] {
  if (row.parentId) {
    const parent = baseMap.get(row.parentId)
    if (parent) parent.children = [row]
    return getCurrentLevel(parent!)
  } else {
    return [row]
  }
}
</script>

<template>
  <el-container class="layout-main">
    <!-- 顶部操作栏 -->
    <el-header height="32px">
      <el-input v-model="tableFilterText" placeholder="输入关键字进行过滤" />
    </el-header>
    <!-- 明细表格 -->
    <el-main style="--el-main-padding: 0">
      <el-tabs model-value="first" stretch style="--el-tabs-header-height: 32px">
        <el-tab-pane :label="`柜体(${tableData.gt.length})`" name="first">
          <el-table
            :data="tableData.gt"
            highlight-current-row
            :row-key="(row) => row.id"
            style="height: var(--content-height)"
            show-overflow-tooltip
            @current-change="tableOnSelect"
            :tree-props="{ children: 'nonono' }"
          >
            <el-table-column sortable prop="modelBrandGoodName" width="100" label="名称" />
            <el-table-column sortable prop="customSize.x" width="52" label="长" />
            <el-table-column sortable prop="customSize.y" width="52" label="宽" />
            <el-table-column sortable prop="customSize.z" width="52" label="高" />
            <el-table-column sortable prop="textureName" width="130" label="材质" />
            <el-table-column sortable prop="modelBrandGoodCode" width="100" label="对接编码" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="`门抽(${tableData.mc.length})`" name="second">
          <el-table
            :data="tableData.mc"
            highlight-current-row
            :row-key="(row) => row.id"
            style="height: var(--content-height)"
            show-overflow-tooltip
            @current-change="tableOnSelect"
          >
            <el-table-column sortable prop="modelBrandGoodName" width="100" label="名称" />
            <el-table-column sortable prop="customSize.x" width="52" label="长" />
            <el-table-column sortable prop="customSize.y" width="52" label="宽" />
            <el-table-column sortable prop="customSize.z" width="52" label="高" />
            <el-table-column sortable prop="textureName" width="130" label="材质" />
            <el-table-column sortable prop="modelBrandGoodCode" width="100" label="对接编码" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="`五金(${tableData.wj.length})`" name="third">
          <el-table
            :data="tableData.wj"
            highlight-current-row
            :row-key="(row) => row.id"
            style="height: var(--content-height)"
            show-overflow-tooltip
            @current-change="tableOnSelect"
          >
            <el-table-column sortable prop="modelBrandGoodName" width="130" label="名称" />
            <el-table-column sortable prop="customSize.x" width="52" label="长" />
            <el-table-column sortable prop="customSize.y" width="52" label="宽" />
            <el-table-column sortable prop="customSize.z" width="52" label="高" />
            <el-table-column sortable prop="qunity" width="64" label="数量" />
            <el-table-column sortable prop="modelBrandGoodCode" width="100" label="对接编码" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-main>
    <!-- 底部详情栏 -->
    <el-footer height="256px" style="--el-footer-padding: 0">
      <el-tabs model-value="second" stretch style="--el-tabs-header-height: 32px">
        <el-tab-pane label="详情" name="second">aaa</el-tab-pane>
        <el-tab-pane label="层级" name="first">
          <el-tree
            ref="levelTreeRef"
            :data="levelTreeData"
            :highlight-current="true"
            node-key="id"
            :props="{ label: 'modelBrandGoodName' }"
            :default-expand-all="true"
            :expand-on-click-node="false"
          />
        </el-tab-pane>

        <el-tab-pane label="变量" name="third">
          <el-input v-model="variableFilterText" placeholder="Filter keyword" />
          <el-scrollbar style="height: 192px">
            <div>
              <el-tree
                ref="variableTreeRef"
                :data="variableTreeData"
                default-expand-all
                style="font-size: 12px"
                :expand-on-click-node="false"
              >
                <template #default="{ data }">
                  <div style="display: flex; justify-content: space-between; padding-right: 16px; width: 100%">
                    <span class="flex-1">{{ data.displayName }}</span>
                    <span class="flex-1">{{ data.name }}</span>
                    <span class="flex-1">{{ data.value }}</span>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </el-footer>
  </el-container>
</template>

<style scoped>
.layout-main {
  height: 100%;
  --el-main-padding: 0;
  --content-height: calc(100vh - 321px);
}

.flex-1 {
  flex: 1;
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
