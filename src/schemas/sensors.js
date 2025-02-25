import { z } from 'zod';

// Base schema for sensor tags
export const tagsSchema = z.array(z.string()).min(1).refine(
    tags => tags.some(tag => tag.startsWith('sensor:')),
    { message: 'At least one sensor tag is required (format: sensor:id)' }
);

// DHT sensor schema
export const dhtSchema = z.object({
    tags: tagsSchema,
    temperature: z.number().optional(),
    humidity: z.number().optional()
}).refine(
    data => data.temperature !== undefined || data.humidity !== undefined,
    { message: 'At least one measurement (temperature or humidity) is required' }
);

// PMS sensor schemas
const pmUgPerM3Schema = z.object({
    '1.0um': z.number(),
    '2.5um': z.number(),
    '10um': z.number()
});

const pmPer1LAirSchema = z.object({
    '0.3um': z.number(),
    '0.5um': z.number(),
    '1.0um': z.number(),
    '2.5um': z.number(),
    '5.0um': z.number(),
    '10um': z.number()
});

export const pmsSchema = z.object({
    tags: tagsSchema,
    pm_ug_per_m3: pmUgPerM3Schema.optional(),
    pm_per_1l_air: pmPer1LAirSchema.optional()
}).refine(
    data => data.pm_ug_per_m3 !== undefined || data.pm_per_1l_air !== undefined,
    { message: 'At least one measurement (pm_ug_per_m3 or pm_per_1l_air) is required' }
); 
