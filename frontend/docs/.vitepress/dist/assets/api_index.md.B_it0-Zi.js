import{_ as b,p as a,v,C as h,c as p,o as r,j as l,G as f,w as g,a as w,t as n}from"./chunks/framework.CSHEQ64G.js";import{E as A}from"./chunks/theme.CzseKamx.js";const P={key:0},I={class:"page-header"},y={key:1},x=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/index.md","filePath":"api/index.md"}'),T={name:"api/index.md"},E=Object.assign(T,{setup(_){const s=a(!1),d=a(null);v(()=>{const t=localStorage.getItem("user");if(t)try{d.value=JSON.parse(t),s.value=!0}catch(e){console.error("解析用户信息失败",e)}s.value||(A.warning("请先登录"),setTimeout(()=>{window.location.href="/login"},1e3))});const i=a([{id:1,name:"用户信息API",description:"提供用户信息查询和管理功能",path:"/api/users",method:"GET",createdAt:"2025-01-15",callCount:12500,status:"active"},{id:2,name:"订单管理API",description:"提供订单创建、查询和管理功能",path:"/api/orders",method:"POST",createdAt:"2025-02-20",callCount:8300,status:"active"},{id:3,name:"支付接口",description:"提供多种支付方式集成",path:"/api/payments",method:"POST",createdAt:"2025-03-05",callCount:5600,status:"active"},{id:4,name:"数据分析API",description:"提供数据统计和分析功能",path:"/api/analytics",method:"GET",createdAt:"2025-03-18",callCount:3200,status:"inactive"},{id:5,name:"文件存储API",description:"提供文件上传和管理功能",path:"/api/files",method:"PUT",createdAt:"2025-04-10",callCount:4800,status:"active"}]),c=a(!1);return a({name:"",description:"",path:"",method:"GET"}),(t,e)=>{const m=h("el-button");return r(),p("div",null,[e[4]||(e[4]=l("p",null,"/**",-1)),e[5]||(e[5]=l("ul",null,[l("li",null,"API管理页面 */")],-1)),l("template",null,[s.value?(r(),p("div",P,[l("div",I,[e[2]||(e[2]=l("h1",null,"API管理",-1)),f(m,{type:"primary",onClick:e[0]||(e[0]=o=>c.value=!0)},{default:g(()=>e[1]||(e[1]=[w("创建API")])),_:1,__:[1]})]),l("pre",null,[l("code",null,`<el-card class="api-stats">
  <el-row :gutter="20">
    <el-col :span="8">
      <div class="stat-item">
        <h3>API总数</h3>
        <p class="stat-value">`+n(i.value.length)+`</p>
      </div>
    </el-col>
    
    <el-col :span="8">
      <div class="stat-item">
        <h3>总调用次数</h3>
        <p class="stat-value">`+n(i.value.reduce((o,u)=>o+u.callCount,0).toLocaleString())+`</p>
      </div>
    </el-col>
    
    <el-col :span="8">
      <div class="stat-item">
        <h3>活跃API</h3>
        <p class="stat-value">`+n(i.value.filter(o=>o.status==="active").length)+`</p>
      </div>
    </el-col>
  </el-row>
</el-card>

<el-card class="api-list">
  <template #header>
    <div class="card-header">
      <span>API列表</span>
      <el-input
        placeholder="搜索API"
        style="width: 300px"
      />
    </div>
  </template>
  
  <el-table :data="apis" style="width: 100%">
    <el-table-column prop="id" label="ID" width="60" />
    <el-table-column prop="name" label="名称" />
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="path" label="路径" />
    <el-table-column prop="method" label="方法" width="100">
      <template #default="scope">
        <el-tag
          :type="scope.row.method === 'GET' ? 'success' : scope.row.method === 'POST' ? 'warning' : 'info'"
        >
          `+n(t.scope.row.method)+`
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="callCount" label="调用次数" width="120">
      <template #default="scope">
        `+n(t.scope.row.callCount.toLocaleString())+`
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100">
      <template #default="scope">
        <el-tag
          :type="scope.row.status === 'active' ? 'success' : 'danger'"
        >
          `+n(t.scope.row.status==="active"?"活跃":"停用")+`
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200">
      <template #default>
        <el-button size="small" type="primary">编辑</el-button>
        <el-button size="small" type="danger">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</el-card>

<!-- 创建API对话框 -->
<el-dialog
  v-model="dialogVisible"
  title="创建新API"
  width="50%"
>
  <el-form :model="newApi" label-width="100px">
    <el-form-item label="API名称">
      <el-input v-model="newApi.name" placeholder="请输入API名称" />
    </el-form-item>
    
    <el-form-item label="描述">
      <el-input v-model="newApi.description" type="textarea" placeholder="请输入API描述" />
    </el-form-item>
    
    <el-form-item label="路径">
      <el-input v-model="newApi.path" placeholder="请输入API路径，例如：/api/users" />
    </el-form-item>
    
    <el-form-item label="请求方法">
      <el-select v-model="newApi.method" placeholder="请选择请求方法">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
      </el-select>
    </el-form-item>
  </el-form>
  
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="createApi">创建</el-button>
    </span>
  </template>
</el-dialog>
`,1)])])):(r(),p("div",y,e[3]||(e[3]=[l("p",null,"正在检查登录状态...",-1)])))])])}}}),O=b(E,[["__scopeId","data-v-feaf4f95"]]);export{x as __pageData,O as default};
