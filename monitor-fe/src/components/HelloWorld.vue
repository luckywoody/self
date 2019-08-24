<template>
  <div style="display: flex;height: 100%;dispaly: relative;">
    <div class="left">
      <p @click="update">远端最新数据：</p>
      <p v-if="t">{{new Date(t).toLocaleString()}}</p>
      <div class="iplist" :style="{maxHeight: tableMaxHeight + 'px'}" style="overflow-y: auto;">
        <p>屏蔽列表：</p>
        <p>广州</p>
        <p v-for="i in hiddenList" :key="i.ip" @click="removeHidden(i.ip)">{{`${i.ip}(${i.c})`}}</p>
      </div>
    </div>
    <div class="container">
      <el-table
      :max-height="tableMaxHeight"
      :data="showTable">
        <el-table-column
          prop="time"
          align="left"
          header-align="left"
          label="time">
        </el-table-column>
        <el-table-column
          prop="site"
          align="left"
          header-align="left"
          label="site">
        </el-table-column>
        <el-table-column
          align="left"
          header-align="left"
          label="ip">
          <template slot-scope="scope">
            <span @click="hidden(scope.row.ipInfo)">
              {{scope.row.ipInfo.ip}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="ipInfo.Country"
          align="left"
          header-align="left"
          label="country">
        </el-table-column>
        <el-table-column
          prop="ipInfo.Area"
          align="left"
          header-align="left"
          label="area">
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 30, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="mainTable.length">
      </el-pagination>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      doing: false,
      table: [],
      pageSize: 10,
      currentPage: 1,
      hiddenList: [],
      t: ''
    }
  },
  created () {
    this.getData()
  },
  computed: {
    mainTable () {
      return this.table.filter(i => {
        return !this.hiddenList.some(ii => ii.ip === i.ipInfo.ip)
      })
    },
    showTable () {
      return this.mainTable.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    },
    tableMaxHeight () {
      return document.body.offsetHeight - 50
    }
  },
  methods: {
    removeHidden (ip) {
      let index = this.hiddenList.findIndex(i => i.ip === ip)
      this.hiddenList.splice(index, 1)
    },
    hidden (o) {
      this.hiddenList.push({
        ip: o.ip,
        c: o.Country
      })
    },
    handleSizeChange (v) {
      this.pageSize = v
    },
    handleCurrentChange (v) {
      this.currentPage = v
    },
    update () {
      this.doing = true
      this.$http.get('/update').then(
        async () => {
          this.$message.success('已更新远端最新数据(<=1.5W)')
          await this.getData()
          this.doing = false
        }
      )
    },
    getData () {
      return this.$http.get('/data').then(
        (res) => {
          this.table = res.data.d.reverse()
          this.t = res.data.t
        }
      )
    }
  }
}
</script>
<style lang="css" scoped>
  .left {
    width: 200px;
    height: 100%;
    border-right: 1px solid red;
  }
  .container {
    flex: 1;
    width: 0;
  }
  .iplist p {
    color: red;
    font-size: 14px;
    margin: 0;
  }
</style>

