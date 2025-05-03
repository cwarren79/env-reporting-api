import { z } from 'zod';

// Base schema for sensor tags
export const tagsSchema = z.array(z.string()).min(1).refine(
    tags => tags.some(tag => tag.startsWith('sensor:')),
    { message: 'At least one sensor tag is required (format: sensor:id)' }
);

// Type for sensor tags
export type Tags = z.infer<typeof tagsSchema>;

// DHT sensor schema
export const dhtSchema = z.object({
    tags: tagsSchema,
    temperature: z.number().optional(),
    humidity: z.number().optional()
}).refine(
    data => data.temperature !== undefined || data.humidity !== undefined,
    { message: 'At least one measurement (temperature or humidity) is required' }
);

// Type for DHT sensor data
export type DHTSensor = z.infer<typeof dhtSchema>;

// PMS sensor schemas
const pmUgPerM3Schema = z.object({
    '1.0um': z.number(),
    '2.5um': z.number(),
    '10um': z.number()
});

// Type for PM measurements in µg/m³
export type PMUgPerM3 = z.infer<typeof pmUgPerM3Schema>;

const pmPer1LAirSchema = z.object({
    '0.3um': z.number(),
    '0.5um': z.number(),
    '1.0um': z.number(),
    '2.5um': z.number(),
    '5.0um': z.number(),
    '10um': z.number()
});

// Type for PM measurements per 1L of air
export type PMPer1LAir = z.infer<typeof pmPer1LAirSchema>;

export const pmsSchema = z.object({
    tags: tagsSchema,
    pm_ug_per_m3: pmUgPerM3Schema.optional(),
    pm_per_1l_air: pmPer1LAirSchema.optional()
}).refine(
    data => data.pm_ug_per_m3 !== undefined || data.pm_per_1l_air !== undefined,
    { message: 'At least one measurement (pm_ug_per_m3 or pm_per_1l_air) is required' }
);

// Type for PMS sensor data
export type PMSSensor = z.infer<typeof pmsSchema>;
