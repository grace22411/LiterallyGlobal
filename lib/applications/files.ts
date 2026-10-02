import { fileTypes, MAX_FILE_BYTES } from "./schema";
export function documentType(name:string,bytes:Uint8Array){
 const ext=name.split(".").pop()?.toLowerCase() as keyof typeof fileTypes;
 if(!ext||!fileTypes[ext]||bytes.length<4||bytes.length>MAX_FILE_BYTES)return null;
 const starts=(signature:number[])=>signature.every((v,i)=>bytes[i]===v);
 if(ext==="pdf"&&!starts([37,80,68,70,45]))return null;
 if(ext==="docx"&&!starts([80,75,3,4]))return null;
 if(ext==="png"&&!starts([137,80,78,71,13,10,26,10]))return null;
 if((ext==="jpg"||ext==="jpeg")&&!starts([255,216,255]))return null;
 return {ext,mime:fileTypes[ext],name:name.replace(/[\r\n\u0000-\u001f/\\]/g,"_").slice(0,150)};
}
