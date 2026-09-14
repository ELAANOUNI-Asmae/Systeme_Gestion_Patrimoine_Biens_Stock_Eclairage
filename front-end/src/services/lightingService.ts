import api from "./api";
import type { AppDocument, DocumentType } from "../types/document";
import type {
  Failure, Intervention, InterventionCompletionData, InterventionPlanData,
  Light, LightFormData, LightStatus, Technician,
} from "../types/lighting";

type Json = Record<string, unknown>;
const text = (v: unknown, f = "") => v == null ? f : String(v).trim();
const num = (v: unknown, f = 0) => { const n = Number(v); return Number.isFinite(n) ? n : f; };
const docTypes: DocumentType[] = ["INVOICE","RECEIPT","CONTRACT","REGISTRATION","INSURANCE","CERTIFICATE","DELIVERY_NOTE","EXIT_VOUCHER","TECHNICAL_SHEET","WARRANTY","REPORT","PHOTO","OTHER"];

function isForbidden(error: unknown): boolean {
  return typeof error === "object" && error !== null && "response" in error && (error as {response?:{status?:number}}).response?.status === 403;
}

function apiError(error: unknown): Error {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as {response?:{data?:unknown}}).response?.data;
    if (typeof data === "string" && data.trim()) return new Error(data);
    if (typeof data === "object" && data !== null) {
      const o = data as Json; const m = text(o.message || o.error); if (m) return new Error(m);
    }
  }
  return error instanceof Error ? error : new Error("Erreur serveur.");
}

function documents(raw: unknown): AppDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is Json => typeof x === "object" && x !== null).map((d, i) => {
    const id = num(d.id, -(i + 1)); const path = text(d.path); const fileName = path.replace(/\\/g,"/").split("/").pop() || path || "document";
    const rt = text(d.type,"OTHER") as DocumentType;
    return { id, backendId: id > 0 ? id : undefined, name: text(d.title_fr || d.title_ar,fileName),
      category: text(d.documentType) === "DOCUMENT_OFFICIEL" ? "OFFICIAL" : "ATTACHMENT",
      type: docTypes.includes(rt) ? rt : "OTHER", fileName, uploadDate: text(d.uploadDate), backendPath: path || undefined };
  });
}

function lightStatus(v: unknown): LightStatus { return text(v) === "FAULTY" ? "DAMAGED" : text(v) === "MAINTENANCE" ? "UNDER_MAINTENANCE" : text(v) === "DECOMMISSIONED" ? "INACTIVE" : "ACTIVE"; }
function backendStatus(v: LightStatus) { return v === "DAMAGED" ? "FAULTY" : v === "UNDER_MAINTENANCE" ? "MAINTENANCE" : v === "INACTIVE" ? "DECOMMISSIONED" : "OPERATIONAL"; }
function mapLight(j: Json): Light { return { id:num(j.id), reference:text(j.reference), designation:text(j.designation_fr), designationAr:text(j.designation_ar,text(j.designation_fr)), localisation:text(j.location), latitude:num(j.latitude), longitude:num(j.longitude), status:lightStatus(j.lightPointStatus), installationDate:text(j.installationDate), power:num(j.power), documents:documents(j.documents) }; }
function mapFailure(j: Json): Failure { const wf=text(j.workflowStatus); return { id:num(j.id), lightId:num(j.lightPointId), lightReference:text(j.lightReference), lightDesignation:text(j.lightDesignation_fr), lightDesignationAr:text(j.lightDesignation_ar,text(j.lightDesignation_fr)), description:text(j.description), reportedBy:text(j.reportedBy,"PUBLIC"), reportedAt:text(j.reportDate), status: wf === "RESOLVED" ? "RESOLVED" : wf === "IN_PROGRESS" ? "IN_PROGRESS" : "REPORTED", documents:documents(j.documents) }; }
function mapIntervention(j: Json): Intervention { const ds=documents(j.documents); return { id:num(j.id), failureId:num(j.failureId), technicianId:num(j.technicianId), technicianName:text(j.technician_name), technicianNameAr:text(j.technician_name_ar,text(j.technician_name)), technicianLocalisation:text(j.technicianLocalisation), interventionDate:text(j.interventionDate).slice(0,10), description:text(j.description), completed:text(j.status)==="COMPLETED", completedAt:text(j.completedAt)||undefined, report:text(j.report)||undefined, cost:j.cost==null?undefined:num(j.cost), photos:ds.filter(d=>d.type==="PHOTO"), documents:ds.filter(d=>d.type!=="PHOTO") }; }
function mapTechnician(j: Json): Technician { const lat = j.latitude == null ? Number.NaN : num(j.latitude,Number.NaN); const lng=j.longitude==null?Number.NaN:num(j.longitude,Number.NaN); return {id:num(j.id),name:text(j.name),nameAr:text(j.nameAr,text(j.name)),phone:text(j.phone),localisation:text(j.localisation),latitude:lat,longitude:lng,active:j.active!==false}; }

function payload(d: LightFormData) { return { reference:d.reference.trim().toUpperCase(), designation_fr:d.designation.trim(), designation_ar:d.designationAr.trim(), location:d.localisation.trim(), latitude:d.latitude, longitude:d.longitude, installationDate:d.installationDate, power:d.power }; }
function docPayload(d: AppDocument) { return { title_fr:d.name,title_ar:d.name,path:null,documentType:d.category==="OFFICIAL"?"DOCUMENT_OFFICIEL":"PIECE_JOINTE",type:d.type,endDate:d.category==="OFFICIAL"?d.expirationDate??null:null,alertThreshold:d.category==="OFFICIAL"?d.reminderDaysBefore??7:null }; }
async function uploadOne(endpoint:string,d:AppDocument){ if(!d.file)return; const f=new FormData(); f.append("file",d.file); f.append("data",new Blob([JSON.stringify(docPayload(d))],{type:"application/json"})); await api.post(endpoint,f,{headers:{"Content-Type":"multipart/form-data"}}); }
async function uploadMany(endpoint:string,ds:AppDocument[]){ for(const d of ds) await uploadOne(endpoint,d); }
const asDateTime=(date:string)=> date.includes("T")?date:`${date}T12:00:00`;

export const lightingService = {
  async getLights(): Promise<Light[]> { try{return (await api.get<Json[]>("/sgpbse/lightPoint/all")).data.map(mapLight);}catch(e){throw apiError(e);} },
  async getPublicLights(): Promise<Light[]> { try{return (await api.get<Json[]>("/sgpbse/lightPoint/public/all")).data.map(mapLight);}catch(e){throw apiError(e);} },
  async getLightById(id:number):Promise<Light>{try{return mapLight((await api.get<Json>(`/sgpbse/lightPoint/${id}`)).data);}catch(e){throw apiError(e);}},
  async getTechnicians():Promise<Technician[]>{try{return (await api.get<Json[]>("/sgpbse/intervention/technicians")).data.map(mapTechnician);}catch(e){if(isForbidden(e))return [];throw apiError(e);}},
  async createLight(data:LightFormData):Promise<Light>{try{const id=num((await api.post<number>("/sgpbse/lightPoint/create",payload(data))).data);await uploadMany(`/sgpbse/lightPoint/joinDoc/${id}`,data.documents);return await this.getLightById(id);}catch(e){throw apiError(e);}},
  async updateLight(id:number,data:LightFormData):Promise<Light>{try{const before=await this.getLightById(id);const kept=new Set(data.documents.map(d=>d.backendId??(d.id>0?d.id:undefined)).filter((x):x is number=>x!==undefined));for(const old of before.documents){const oid=old.backendId??(old.id>0?old.id:undefined);if(oid&&!kept.has(oid))await api.delete(`/sgpbse/lightPoint/${id}/document/${oid}`);}await api.put(`/sgpbse/lightPoint/update/${id}`,payload(data));await api.put(`/sgpbse/lightPoint/updateStatus/${id}`,backendStatus(data.status),{headers:{"Content-Type":"application/json"}});await uploadMany(`/sgpbse/lightPoint/joinDoc/${id}`,data.documents);return await this.getLightById(id);}catch(e){throw apiError(e);}},
  async removeLight(id:number):Promise<void>{try{await api.delete(`/sgpbse/lightPoint/delete/${id}`);}catch(e){throw apiError(e);}},
  async getFailures():Promise<Failure[]>{try{return (await api.get<Json[]>("/sgpbse/failure/all")).data.map(mapFailure);}catch(e){if(isForbidden(e))return [];throw apiError(e);}},
  async getPublicOpenFailures():Promise<Failure[]>{try{return (await api.get<Json[]>("/sgpbse/failure/public/open")).data.map(j=>({id:num(j.id),lightId:num(j.lightPointId),lightReference:"",lightDesignation:"",lightDesignationAr:"",description:"",reportedBy:"PUBLIC",reportedAt:"",status:text(j.status)==="RESOLVED"?"RESOLVED":text(j.status)==="IN_PROGRESS"?"IN_PROGRESS":"REPORTED",documents:[]}));}catch(e){throw apiError(e);}},
  async getFailuresByLightId(lightId:number):Promise<Failure[]>{return (await this.getFailures()).filter(x=>x.lightId===lightId);},
  async createFailure(data:{lightId:number;description:string;reportedBy:string;documents?:AppDocument[]}):Promise<Failure>{try{const response=await api.post<Json>(`/sgpbse/failure/report/${data.lightId}`,{description:data.description,lightPointId:data.lightId,reportedBy:data.reportedBy});const failure=mapFailure(response.data);await uploadMany(`/sgpbse/failure/joinDoc/${failure.id}`,data.documents??[]);return (await this.getFailures()).find(x=>x.id===failure.id)??failure;}catch(e){throw apiError(e);}},
  async createPublicFailure(data:{lightId:number;description:string;documents?:AppDocument[]}):Promise<Failure>{try{const response=await api.post<Json>(`/sgpbse/failure/public/report/${data.lightId}`,{description:data.description,lightPointId:data.lightId,reportedBy:"PUBLIC"});const failure=mapFailure(response.data);await uploadMany(`/sgpbse/failure/public/joinDoc/${failure.id}`,data.documents??[]);return failure;}catch(e){throw apiError(e);}},
  async updateFailureStatus(_id:number,_status:Failure["status"]):Promise<Failure>{throw new Error("Le statut est géré automatiquement par les interventions.");},
  async getInterventions():Promise<Intervention[]>{try{return (await api.get<Json[]>("/sgpbse/intervention/all")).data.map(mapIntervention);}catch(e){if(isForbidden(e))return [];throw apiError(e);}},
  async getInterventionsByFailureId(failureId:number):Promise<Intervention[]>{return (await this.getInterventions()).filter(x=>x.failureId===failureId);},
  async createIntervention(data:InterventionPlanData):Promise<Intervention>{try{const r=await api.post<Json>(`/sgpbse/intervention/schedule/${data.failureId}`,{interventionDate:asDateTime(data.interventionDate),description:data.description,technician_id:data.technicianId});const item=mapIntervention(r.data);await uploadMany(`/sgpbse/intervention/joinDoc/${item.id}`,data.documents??[]);return (await this.getInterventions()).find(x=>x.id===item.id)??item;}catch(e){throw apiError(e);}},
  async completeIntervention(id:number,data:InterventionCompletionData):Promise<Intervention>{try{const r=await api.post<Json>(`/sgpbse/intervention/complete/${id}`,{report:data.report,cost:data.cost,completedAt:asDateTime(data.completedAt)});await uploadMany(`/sgpbse/intervention/joinDoc/${id}`,[...data.photos,...(data.documents??[])]);return (await this.getInterventions()).find(x=>x.id===id)??mapIntervention(r.data);}catch(e){throw apiError(e);}},
};
