import{_ as f,p as l,v as g,C as w,c as r,o as i,j as t,G as y,w as h,a as T,t as m}from"./chunks/framework.CZC2ghGB.js";import{E as _}from"./chunks/theme.DI_0WAGa.js";const k={key:0},C={class:"page-header"},S={key:1},B=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"team/index.md","filePath":"team/index.md"}'),x={name:"team/index.md"},I=Object.assign(x,{setup(M){const o=l(!1),a=l(null),d=(n,e)=>{localStorage.setItem(`team_members_${n}`,JSON.stringify(e))};l(!1),l(null),l([]),l(""),l([]),g(()=>{const n=localStorage.getItem("user");if(n)try{a.value=JSON.parse(n),o.value=!0,c()}catch(e){console.error("解析用户信息失败",e)}o.value||(_.warning("请先登录"),setTimeout(()=>{window.location.href="/login"},1e3))});const p=()=>{const n=localStorage.getItem("teams");return n?JSON.parse(n):[]},u=n=>{localStorage.setItem("teams",JSON.stringify(n))},c=()=>{let n=p();n.length===0&&(n=[{id:1,name:"研发团队",description:"负责产品研发和技术支持",memberCount:1,apiCount:12,createdAt:"2025-01-10",createdBy:a.value.username},{id:2,name:"市场团队",description:"负责产品营销和市场推广",memberCount:1,apiCount:3,createdAt:"2025-02-15",createdBy:a.value.username},{id:3,name:"客户服务团队",description:"负责客户支持和服务",memberCount:1,apiCount:4,createdAt:"2025-03-20",createdBy:a.value.username}],n.forEach(e=>{const s={id:Date.now()+e.id,username:a.value.username,role:"owner",joinedAt:e.createdAt};d(e.id,[s])}),u(n)),b.value=n},b=l([]),v=l(!1);return l({name:"",description:""}),(n,e)=>{const s=w("el-button");return i(),r("div",null,[e[4]||(e[4]=t("p",null,"/**",-1)),e[5]||(e[5]=t("ul",null,[t("li",null,"团队管理页面 */")],-1)),t("template",null,[o.value?(i(),r("div",k,[t("div",C,[e[2]||(e[2]=t("h1",null,"团队管理",-1)),y(s,{type:"primary",onClick:e[0]||(e[0]=A=>v.value=!0)},{default:h(()=>e[1]||(e[1]=[T("创建团队")])),_:1,__:[1]})]),t("pre",null,[t("code",null,`<el-card class="team-list">
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
      <template #default="scope">
        <el-button size="small" type="primary" @click="openMemberDialog(scope.row)">管理成员</el-button>
        <el-button size="small" type="success">查看API</el-button>
        <el-button size="small" type="danger" @click="deleteTeam(scope.row)">删除</el-button>
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

<!-- 团队成员管理对话框 -->
<el-dialog
  v-model="memberDialogVisible"
  :title="\`团队成员管理 - \${currentTeam ? currentTeam.name : ''}\`"
  width="60%"
>
  <div class="member-management">
    <!-- 添加成员表单 -->
    <div class="add-member-form">
      <el-form inline>
        <el-form-item label="添加成员">
          <el-select 
            v-model="newMemberUsername" 
            placeholder="选择用户" 
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.username"
              :label="user.username"
              :value="user.username"
            >
              <div class="user-option">
                <span>`+m(n.user.username)+`</span>
                <small>(`+m(n.user.email)+`)</small>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addTeamMember">添加</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="availableUsers.length === 0" class="no-users-tip">
        <el-alert
          title="没有可添加的用户"
          type="info"
          description="所有注册用户已在团队中，或者没有其他注册用户。"
          show-icon
        />
      </div>
    </div>
    
    <!-- 成员列表 -->
    <div class="member-list">
      <h3>团队成员列表</h3>
      
      <el-table :data="teamMembers" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'owner' ? 'danger' : 'success'">
              `+m(n.scope.row.role==="owner"?"创建者":"成员")+`
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinedAt" label="加入时间" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              size="small" 
              type="danger" 
              @click="removeTeamMember(scope.row)"
              :disabled="scope.row.role === 'owner'"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="teamMembers.length === 0" class="no-members-tip">
        <el-alert
          title="团队暂无成员"
          type="warning"
          description="请添加团队成员以开始协作。"
          show-icon
        />
      </div>
    </div>
  </div>
</el-dialog>
`,1)])])):(i(),r("div",S,e[3]||(e[3]=[t("p",null,"正在检查登录状态...",-1)])))])])}}}),D=f(I,[["__scopeId","data-v-ad54920d"]]);export{B as __pageData,D as default};
