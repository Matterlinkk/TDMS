type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object';

type TemplateFields = Record<string, FieldDefinition>

type TypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    date: Date;
    object: object
}

interface FieldDefinition<T extends FieldType = FieldType> {
    type: T;
    required?: boolean;
    defaultValue?: TypeMap[T];
}

export type { FieldType, TemplateFields, TypeMap, FieldDefinition };