import{r as t,_ as r,j as e,s as i}from"./index-LqOURNGf.js";const p=t.lazy(()=>r(()=>import("./CompleteSignUp-SA6EZBoQ.js"),__vite__mapDeps([0,1,2,3]))),d=()=>{const[o,s]=t.useState(!0),a=async()=>{const n=await i();s(n)};return t.useEffect(()=>{a()},[]),e.jsx(e.Fragment,{children:!o&&e.jsx(t.Suspense,{fallback:e.jsx("div",{children:"Loading..."}),children:e.jsx(p,{setSignupCompleted:s})})})};export{d as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/CompleteSignUp-SA6EZBoQ.js","assets/index-LqOURNGf.js","assets/index-Z8wdi4L6.css","assets/Grid-fES7pWt6.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
