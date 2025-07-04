import type { TemplateFields } from '@models/templateTypes';

interface Template {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    lastUpdatedAt: Date;
    tags?: string[];
    fields: TemplateFields;
}

export type { Template };