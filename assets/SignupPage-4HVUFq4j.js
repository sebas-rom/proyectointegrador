import{u as y,a as E,r as t,j as e,C as P,b as a,T as c,B as o,c as A,F,I as W,O as I,d as U,e as k,f as D,g as B,N as T,h as G,i as L}from"./index-LqOURNGf.js";const q=()=>{const n=y(),{showError:r}=E(),[i,m]=t.useState(""),[l,h]=t.useState(""),[p,x]=t.useState(!1),[g,w]=t.useState(!1),f=async()=>{try{await G()&&(w(!0),n("/dashboard"))}catch(s){r("Sign Up Error",s.code)}},j=async s=>{s.preventDefault();try{await L(i,l)&&n("/dashboard")}catch(u){r("Sign Up Error",u.code)}},S=()=>{x(!0)},[d,v]=t.useState(!1),C=()=>v(s=>!s),b=s=>{s.preventDefault()};return e.jsx(P,{component:"main",maxWidth:"xs",children:e.jsxs(a,{sx:{marginTop:8,display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsx(c,{component:"h1",variant:"h5",children:"FocusApp"}),e.jsx(o,{fullWidth:!0,variant:"contained",sx:{mt:3,mb:2},onClick:f,disabled:g,children:"Continue with Google"}),e.jsx(o,{fullWidth:!0,variant:"contained",sx:{mt:1,mb:2},onClick:S,children:"Continue with Email"}),p&&e.jsxs(a,{component:"form",onSubmit:j,sx:{mt:1},children:[e.jsx(A,{margin:"normal",required:!0,fullWidth:!0,id:"email",label:"Email Address",name:"email",autoComplete:"email",autoFocus:!0,value:i,onChange:s=>m(s.target.value)}),e.jsxs(F,{variant:"outlined",fullWidth:!0,children:[e.jsx(W,{htmlFor:"outlined-adornment-password",children:"Password"}),e.jsx(I,{onChange:s=>h(s.target.value),value:l,autoComplete:"current-password",id:"outlined-adornment-password",name:"password",required:!0,fullWidth:!0,type:d?"text":"password",endAdornment:e.jsx(U,{position:"end",children:e.jsx(k,{"aria-label":"toggle password visibility",onClick:C,onMouseDown:b,edge:"end",children:d?e.jsx(D,{}):e.jsx(B,{})})}),label:"Password"})]}),e.jsx(o,{type:"submit",fullWidth:!0,variant:"contained",sx:{mt:3,mb:2},children:"Create Account"})]}),e.jsx(a,{sx:{mt:2},children:e.jsxs(c,{variant:"body2",color:"textSecondary",children:["Already have an account? ",e.jsx(T,{to:"/login",children:"Sign in"})]})})]})})};export{q as default};
