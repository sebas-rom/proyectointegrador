import{ae as E,ac as P,r as s,j as e,af as A,a7 as t,a4 as o,a5 as n,ag as F,ah as U,ai as W,aj as k,ak as D,a8 as I,al as B,am as G,an as m,ao as T,ap as q}from"./index-H2AXzJ-N.js";const M=()=>{const r=E(),{showError:i}=P(),[l,h]=s.useState(""),[d,p]=s.useState(""),[x,g]=s.useState(!1),[w,j]=s.useState(!1),f=async()=>{try{await T()&&(j(!0),r("/dashboard"))}catch(a){i("Sign Up Error",a.code)}},S=async a=>{a.preventDefault();try{await q(l,d)&&r("/dashboard")}catch(c){i("Sign Up Error",c.code)}},v=()=>{g(!0)},[u,b]=s.useState(!1),y=()=>b(a=>!a),C=a=>{a.preventDefault()};return e.jsx(A,{component:"main",maxWidth:"xs",children:e.jsxs(t,{sx:{marginTop:8,display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsx(o,{component:"h1",variant:"h5",children:"FocusApp"}),e.jsx(n,{fullWidth:!0,variant:"contained",sx:{mt:3,mb:2},onClick:f,disabled:w,children:"Continue with Google"}),e.jsx(n,{fullWidth:!0,variant:"contained",sx:{mt:1,mb:2},onClick:v,children:"Continue with Email"}),x&&e.jsxs(t,{component:"form",onSubmit:S,sx:{mt:1},children:[e.jsx(F,{margin:"normal",required:!0,fullWidth:!0,id:"email",label:"Email Address",name:"email",autoComplete:"email",autoFocus:!0,value:l,onChange:a=>h(a.target.value)}),e.jsxs(U,{variant:"outlined",fullWidth:!0,children:[e.jsx(W,{htmlFor:"outlined-adornment-password",children:"Password"}),e.jsx(k,{onChange:a=>p(a.target.value),value:d,autoComplete:"current-password",id:"outlined-adornment-password",name:"password",required:!0,fullWidth:!0,type:u?"text":"password",endAdornment:e.jsx(D,{position:"end",children:e.jsx(I,{"aria-label":"toggle password visibility",onClick:y,onMouseDown:C,edge:"end",children:u?e.jsx(B,{}):e.jsx(G,{})})}),label:"Password"})]}),e.jsx(o,{variant:"body2",color:"textSecondary",children:e.jsx(m,{to:"/signup",children:"Forgot password?"})}),e.jsx(n,{type:"submit",fullWidth:!0,variant:"contained",sx:{mt:3,mb:2},children:"Create Account"})]}),e.jsx(t,{sx:{mt:2},children:e.jsxs(o,{variant:"body2",color:"textSecondary",children:["Already have an account? ",e.jsx(m,{to:"/login",children:"Sign in"})]})})]})})};export{M as default};