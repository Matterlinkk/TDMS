import { Template } from "@interfaces/template";
import type { FieldType, TemplateFields, TypeMap, FieldDefinition } from "@types/templateTypes";

class TemplateFieldsBuilder {
    private fields: TemplateFields = {}

    fromTemplate(template: Template): this {
        this.fields = {...template.fields}
        return this
    }

    toTemplate(templateData: Omit<Template, 'fields' | 'lastUpdatedAt'>): Template {
        const validationErrors = this.validate()

        if (validationErrors.length > 0) {
            throw new Error(`Validation failed ${validationErrors.join(', ')}`)
        }

        return {
            ...templateData,
            lastUpdatedAt: new Date(),
            fields: Object.freeze({...this.fields})
        }
    }

    updateTemplate(template: Template, changes: Partial<Omit<Template, "fields" | "lastUpdatedAt">>): Template {
        const validationErrors = this.validate()

        if (validationErrors.length > 0) {
            throw new Error(`Validation failed ${validationErrors.join(', ')}`)
        }

        return {
            ...template,
            ...changes,
            lastUpdatedAt: new Date(),
            fields: Object.freeze({...this.fields})
        }
    }

    addField<T extends FieldType>(
        name: string,
        definition: FieldDefinition<T>
    ): this {
        if (!name || name.trim() === '') {
            throw new Error(`Field name must be a non-empty string\nInvalid string: ${name}`)
        }

        if (this.fields[name]) {
            throw new Error(`The field with name "${name}" already exists`)
        }

        if (definition.defaultValue !== undefined) {
            if (!this.isValidDefaultValue(definition.type, definition.defaultValue)) {
                throw new Error(`Default value for field '${name}' doesn't match type '${definition.type}'`)
            }
        }

        this.fields[name] = {...definition} as FieldDefinition;
        return this;
    }

    updateField<T extends FieldType>(name: string, updatedDefinition: Partial<FieldDefinition<T>>): this {
        if (!this.hasField(name)) {
            throw new Error(`Field with name "${name}" does not exist. You need to add a field instead`)
        }

        const currentField = this.fields[name]
        const updatedField = {...currentField, ...updatedDefinition}

        if (updatedDefinition.defaultValue !== undefined) {
            const fieldType = updatedDefinition.type ?? currentField.type
            if (!this.isValidDefaultValue(fieldType as T, updatedDefinition.defaultValue)) {
                throw new Error(`Default value for field "${name}" does not match type "${fieldType}"`)
            }
        }

        if (updatedDefinition.type &&
            updatedDefinition.type !== currentField.type &&
            updatedDefinition.defaultValue === undefined &&
            currentField.defaultValue !== undefined) {
            if (!this.isValidDefaultValue(updatedDefinition.type as T, currentField.defaultValue)) {
                throw new Error(`Existing default value for field "${name}" does not match new type "${updatedDefinition.type}". Please provide a new defaultValue or set it to undefined`)
            }
        }

        this.fields[name] = updatedField as FieldDefinition
        return this
    }

    private isValidDefaultValue<T extends FieldType>(
        type: T,
        value: unknown
    ): value is TypeMap[T] {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'date':
                return value instanceof Date && !isNaN(value.getTime());
            case 'object':
                return typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value) &&
                    !(value instanceof Date);
            default:
                return false;
        }
    }

    hasField(name: string): boolean {
        return name in this.fields;
    }

    removeField(name: string): this {
        delete this.fields[name];
        return this;
    }

    validate(): string[] {
        const errors: string[] = [];

        if (Object.keys(this.fields).length === 0) {
            errors.push('Builder has no fields defined');
        }

        return errors;
    }

    build(): Readonly<TemplateFields> {
        const validationErrors = this.validate()

        if (validationErrors.length > 0) {
            throw new Error(`Validation failed ${validationErrors.join(', ')}`)
        }

        return Object.freeze({...this.fields})
    }
}

export { TemplateFieldsBuilder };
export type { TemplateFields };