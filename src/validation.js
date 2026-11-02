import {z} from 'zod';
const coordinate=z.tuple([z.number().min(-180).max(180),z.number().min(-90).max(90)]);
export const geometry=z.discriminatedUnion('type',[z.object({type:z.literal('Point'),coordinates:coordinate}),z.object({type:z.literal('Polygon'),coordinates:z.array(z.array(coordinate).min(4).max(2000)).min(1).max(20)}).refine(g=>g.coordinates.every(r=>r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1]),'Polygon rings must be closed')]);
export const assetInput=z.object({name:z.string().trim().min(1).max(200),service:z.enum(['agri','dams','building']),geometry});
export const enquiryInput=z.object({name:z.string().trim().min(1).max(100),email:z.email(),organization:z.string().max(200).default(''),phone:z.string().max(30).default(''),solution:z.string().max(100),location:z.string().max(300),message:z.string().min(10).max(10000)});
