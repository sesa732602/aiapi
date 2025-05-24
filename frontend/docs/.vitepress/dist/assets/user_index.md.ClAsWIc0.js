import{_ as d,p as o,v as c,c as i,o as r,j as n,t as l}from"./chunks/framework.CSHEQ64G.js";import{E as p}from"./chunks/theme.CzseKamx.js";const u={key:0},v={key:1},x=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"user/index.md","filePath":"user/index.md"}'),m={name:"user/index.md"},g=Object.assign(m,{setup(f){const s=o(!1),t=o(null);return c(()=>{const a=localStorage.getItem("user");if(a)try{t.value=JSON.parse(a),s.value=!0}catch(e){console.error("解析用户信息失败",e)}s.value||(p.warning("请先登录"),setTimeout(()=>{window.location.href="/login"},1e3))}),(a,e)=>(r(),i("div",null,[e[2]||(e[2]=n("p",null,"/**",-1)),e[3]||(e[3]=n("ul",null,[n("li",null,"用户中心页面 */")],-1)),n("template",null,[s.value?(r(),i("div",u,[e[0]||(e[0]=n("h1",null,"用户中心",-1)),n("pre",null,[n("code",null,`<el-card class="user-info-card">
  <template #header>
    <div class="card-header">
      <span>个人资料</span>
      <el-button type="primary" size="small">编辑资料</el-button>
    </div>
  </template>
  
  <div class="user-info">
    <div class="avatar">
      <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
    </div>
    
    <div class="info">
      <p><strong>用户名:</strong> `+l(t.value.username)+`</p>
      <p><strong>角色:</strong> `+l(t.value.role==="admin"?"管理员":t.value.role==="super_admin"?"超级管理员":"普通用户")+`</p>
      <p><strong>注册时间:</strong> `+l(new Date().toLocaleDateString())+`</p>
    </div>
  </div>
  
  <div class="actions">
    <el-button type="danger" @click="logout">退出登录</el-button>
  </div>
</el-card>

<el-card class="stats-card">
  <template #header>
    <div class="card-header">
      <span>账户统计</span>
    </div>
  </template>
  
  <el-row :gutter="20">
    <el-col :span="8">
      <div class="stat-item">
        <h3>API数量</h3>
        <p class="stat-value">5</p>
      </div>
    </el-col>
    
    <el-col :span="8">
      <div class="stat-item">
        <h3>团队数量</h3>
        <p class="stat-value">2</p>
      </div>
    </el-col>
    
    <el-col :span="8">
      <div class="stat-item">
        <h3>订单数量</h3>
        <p class="stat-value">8</p>
      </div>
    </el-col>
  </el-row>
</el-card>

<el-card class="recent-activity-card">
  <template #header>
    <div class="card-header">
      <span>最近活动</span>
    </div>
  </template>
  
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in 5"
      :key="index"
      :timestamp="new Date(Date.now() - index * 86400000).toLocaleString()"
      placement="top"
    >
      <el-card>
        <h4>活动 `+l(5-a.index)+`</h4>
        <p>这是一条模拟的活动记录，展示用户最近的操作历史。</p>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</el-card>
`,1)])])):(r(),i("div",v,e[1]||(e[1]=[n("p",null,"正在检查登录状态...",-1)])))])]))}}),y=d(g,[["__scopeId","data-v-fa6d8adb"]]);export{x as __pageData,y as default};
