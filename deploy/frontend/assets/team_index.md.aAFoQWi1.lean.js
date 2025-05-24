import{_ as m,p as l,v as p,C as u,c as o,o as i,j as t,G as c,w as b,a as f}from"./chunks/framework.CZC2ghGB.js";import{E as v}from"./chunks/theme.DI_0WAGa.js";const g={key:0},w={class:"page-header"},_={key:1},A=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"team/index.md","filePath":"team/index.md"}'),y={name:"team/index.md"},h=Object.assign(y,{setup(x){const n=l(!1),s=l(null);p(()=>{const a=localStorage.getItem("user");if(a)try{s.value=JSON.parse(a),n.value=!0}catch(e){console.error("解析用户信息失败",e)}n.value||(v.warning("请先登录"),setTimeout(()=>{window.location.href="/login"},1e3))}),l([{id:1,name:"研发团队",description:"负责产品研发和技术支持",memberCount:8,apiCount:12,createdAt:"2025-01-10"},{id:2,name:"市场团队",description:"负责产品营销和市场推广",memberCount:5,apiCount:3,createdAt:"2025-02-15"},{id:3,name:"客户服务团队",description:"负责客户支持和服务",memberCount:6,apiCount:4,createdAt:"2025-03-20"}]);const r=l(!1);return l({name:"",description:""}),(a,e)=>{const d=u("el-button");return i(),o("div",null,[e[5]||(e[5]=t("p",null,"/**",-1)),e[6]||(e[6]=t("ul",null,[t("li",null,"团队管理页面 */")],-1)),t("template",null,[n.value?(i(),o("div",g,[t("div",w,[e[2]||(e[2]=t("h1",null,"团队管理",-1)),c(d,{type:"primary",onClick:e[0]||(e[0]=C=>r.value=!0)},{default:b(()=>e[1]||(e[1]=[f("创建团队")])),_:1,__:[1]})]),e[3]||(e[3]=t("pre",null,[t("code",null,`<el-card class="team-list">
  <template #header>
    <div class="card-header">
      <span>我的团队</span>
      <el-input
        placeholder="搜索团队"
        style="width: 300px"
      />
    </div>
  </template>
  
  <el-table :data="teams" style="width: 100%">
    <el-table-column prop="id" label="ID" width="60" />
    <el-table-column prop="name" label="名称" />
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="memberCount" label="成员数" width="100" />
    <el-table-column prop="apiCount" label="API数量" width="100" />
    <el-table-column prop="createdAt" label="创建时间" width="120" />
    <el-table-column label="操作" width="250">
      <template #default>
        <el-button size="small" type="primary">管理成员</el-button>
        <el-button size="small" type="success">查看API</el-button>
        <el-button size="small" type="danger">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</el-card>

<!-- 创建团队对话框 -->
<el-dialog
  v-model="dialogVisible"
  title="创建新团队"
  width="50%"
>
  <el-form :model="newTeam" label-width="100px">
    <el-form-item label="团队名称">
      <el-input v-model="newTeam.name" placeholder="请输入团队名称" />
    </el-form-item>
    
    <el-form-item label="描述">
      <el-input v-model="newTeam.description" type="textarea" placeholder="请输入团队描述" />
    </el-form-item>
  </el-form>
  
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="createTeam">创建</el-button>
    </span>
  </template>
</el-dialog>
`)],-1))])):(i(),o("div",_,e[4]||(e[4]=[t("p",null,"正在检查登录状态...",-1)])))])])}}}),T=m(h,[["__scopeId","data-v-a7483b91"]]);export{A as __pageData,T as default};
