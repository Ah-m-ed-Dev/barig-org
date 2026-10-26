import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sections, type Row } from './data';

type Workspace = { records: Record<string, Row[]>; update: (key: string, rows: Row[]) => void; settings: Record<string,string>; saveSettings: (values: Record<string,string>) => void };
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({children}:{children:ReactNode}) {
 const [records,setRecords]=useState<Record<string,Row[]>>(()=>Object.fromEntries(Object.entries(sections).map(([key,s])=>[key,s.rows])));
 const [settings,setSettings]=useState<Record<string,string>>({organization:'منظمة بريق للتنمية والعمل المجتمعي',phone:'+24916556596',email:'bariqorg26@gmail.com',address:'نيالا، جنوب دارفور، السودان',currency:'USD',amounts:'50، 100، 250، 500'});
 const [ready,setReady]=useState(false);
 useEffect(()=>{try {const stored=localStorage.getItem('bariq-ui-workspace');if(stored){const data=JSON.parse(stored);if(data.records)setRecords(data.records);if(data.settings)setSettings(data.settings);}}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('bariq-ui-workspace',JSON.stringify({records,settings}));}catch{}},[records,settings,ready]);
 return <Context.Provider value={{records,settings,update:(key,rows)=>setRecords(prev=>({...prev,[key]:rows})),saveSettings:values=>setSettings(prev=>({...prev,...values}))}}>{children}</Context.Provider>;
}
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error('Workspace provider missing');return value;}