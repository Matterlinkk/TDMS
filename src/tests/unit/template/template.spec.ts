import {TemplateFieldsBuilder} from "@builders/templateFieldsBuilder";
import {Template} from "@interfaces/template";

describe("Test template feature scope", () => {
    let builder: TemplateFieldsBuilder

    beforeEach(() => {
        builder = new TemplateFieldsBuilder()
    })

    describe('Fields creation suite | addField()', () => {

        describe("Positive tests", () => {
            test('Check created value exists', () => {
                builder
                    .addField("name", {type: "string"})
                expect(builder.hasField("name")).toBe(true)
            })

            test('Check a missing value does not exist', () => {
                builder
                    .addField("name", {type: "string"})
                expect(builder.hasField("non-value")).toBe(false)
            })

            test('Create a field with "defaultValue" attribute', () => {
                const result = builder
                    .addField("name", {type: "string", defaultValue: "testString"})
                    .build()
                expect(result).toEqual({"name": {type: "string", defaultValue: "testString"}})
            })

            test('Create a field with "string" type attribute', () => {
                const result = builder
                    .addField("key", {type: "string", required: true})
                    .build()
                expect(result["key"].type).toBe("string")
            })

            test('Create a field with "number" type attribute', () => {
                const result = builder
                    .addField("key", {type: "number"})
                    .build()
                expect(result["key"].type).toBe("number")
            })

            test('Create a field with "boolean" type attribute', () => {
                const result = builder
                    .addField("key", {type: "boolean"})
                    .build()
                expect(result["key"].type).toBe("boolean")
            })

            test('Create a field with "date" type attribute', () => {
                const result = builder
                    .addField("key", {type: "date", defaultValue: new Date()})
                    .build()
                expect(result["key"].type).toBe("date")
            })

            test('Create a field with "object" type attribute', () => {
                const result = builder
                    .addField("key", {type: "object", defaultValue: {"name": "John"}})
                    .build()
                expect(result["key"].type).toBe("object")
            })

            test('Create fields "name" and "Name", check creation of these fields is valid', () => {
                builder
                    .addField("key", {type: "date", defaultValue: new Date()})
                    .addField("Key", {type: "date", defaultValue: new Date()})
                expect(builder.hasField("Key")).toBe(true)
                expect(builder.hasField("key")).toBe(true)
            })

            test('Create fields with spec symbol(-s)', () => {
                builder
                    .addField("key$", {type: "date", defaultValue: new Date()})
                expect(builder.hasField("key$")).toBe(true)
            })
        })

        describe("Negative tests", () => {
            test('Create a field with blank name field', () => {
                expect(() => {
                    builder
                        .addField("  ", {type: "object", defaultValue: {"name": "John"}})
                        .build()
                }).toThrow(`Field name must be a non-empty string\nInvalid string: `)
            })

            test('Create a field with already existed name', () => {
                expect(() => {
                    builder
                        .addField("key", {type: "object", defaultValue: {"name": "John"}})
                        .addField("key", {type: "number", defaultValue: 1})
                        .build()
                }).toThrow(`The field with name "key" already exists`)
            })

            test('Check validation of types is working correctly', () => {
                expect(() => {
                    builder
                        .addField("key", {type: "object", defaultValue: 1 as any})
                        .build()
                }).toThrow(`Default value for field 'key' doesn't match type 'object'`)
            })

            test('Create field with name longer than 50 symbols', () => {
                const fieldName = "q".repeat(51)

                expect(() => {
                    builder
                        .addField(`${fieldName}`, {type: "object", defaultValue: {}})
                        .build()
                }).toThrow(`"${fieldName}" field's length more than 50 symbols`)
            })

            test('Create builder with no fields', () => {
                expect(() => {
                    builder.build()
                }).toThrow("Validation failed Builder has no fields defined")
            })
        })
    });

    describe("Field updates suite | updateField()", () => {
        describe("Positive tests", () => {
            test("Check is possible to update field", () => {
                const result = builder
                    .addField("key", {type: "string", required: false})
                    .updateField("key", {required: true})
                    .build()

                expect(result["key"].required).toBe(true)
            })

            test("Update type of the element", () => {
                const result = builder
                    .addField("key", {type: "string"})
                    .updateField("key", {type: "number"})
                    .build()

                expect(result["key"].type).toBe("number")
            })

            test("Update type of the field with defaultValue", () => {
                const result = builder
                    .addField("key", {type: "string", defaultValue: "text"})
                    .updateField("key", {type: "number", defaultValue: 123})
                    .build()

                expect(result["key"].type).toBe("number")
                expect(result["key"].defaultValue).toBe(123)
            })
        })

        describe("Negative tests", () => {
            test("Update type of the fields without changing the defaultValue", () => {
                builder
                    .addField("key", {type: "string", defaultValue: "text"})
                expect(() => {
                    builder.updateField("key", {type: "number"})
                }).toThrow('Existing default value for field "key" does not match new type "number". Please provide a new defaultValue or set it to undefined')
            })

            test("Update field that does not exist", () => {
                expect(() => {
                    builder.updateField("nonExistentField", {required: true})
                }).toThrow('Field with name "nonExistentField" does not exist. You need to add a field instead')
            })

            test("Update field with invalid defaultValue type", () => {
                builder.addField("key", {type: "string"})
                expect(() => {
                    builder.updateField("key", {defaultValue: 123 as any})
                }).toThrow('Default value for field "key" does not match type "string"')
            })
        })
    })

    describe("Field deletion suite | removeField()", () => {
        describe("Positive tests", () => {
            test("Check the fields is removed", () => {
                builder
                    .addField("name", {type: "string", required: true, defaultValue: "unknown"})
                    .addField("surname", {type: "string", required: true})
                    .addField("age", {type: "number", required: true})
                    .removeField("age")

                expect(builder.hasField("age")).toBe(false)
            })

            test("Try to delete not existing field", () => {
                builder
                    .addField("name", {type: "string", required: true, defaultValue: "unknown"})
                    .removeField("surname")

                expect(builder.hasField("name")).toBe(true)
            })

            test("Remove field and check remaining fields are intact", () => {
                builder
                    .addField("field1", {type: "string"})
                    .addField("field2", {type: "number"})
                    .addField("field3", {type: "boolean"})
                    .removeField("field2")

                expect(builder.hasField("field1")).toBe(true)
                expect(builder.hasField("field2")).toBe(false)
                expect(builder.hasField("field3")).toBe(true)
            })
        })
    })

    describe("Template creation suite", () => {
        describe("Positive tests", () => {
            const dayBefore = new Date(Date.now() - 24 * 60 * 60 * 1000)

            const template: Template = {
                id: "id#1",
                description: "Test template description",
                name: "testTemplate",
                createdAt: dayBefore,
                lastUpdatedAt: dayBefore,
                tags: ["test", "example"],
                fields: {
                    "name": {type: "string", required: true, defaultValue: "unknown"},
                    "surname": {type: "string", required: true, defaultValue: "unknown"},
                    "age": {type: "number", defaultValue: 0},
                }
            }

            test("Create template with fields in it", () => {
                const newTemplate: Omit<Template, "fields" | "lastUpdatedAt"> = {
                    id: template.id,
                    description: template.description,
                    name: template.name,
                    createdAt: template.createdAt,
                    tags: template.tags
                }

                const createdTemplate = builder
                    .addField("key", {type: "boolean", required: true})
                    .addField("keyCount", {type: "number"})
                    .toTemplate(newTemplate)

                expect(createdTemplate.lastUpdatedAt).not.toEqual(dayBefore)
                expect(createdTemplate.createdAt).toEqual(dayBefore)
                expect(createdTemplate.fields).toEqual({"key": {type: "boolean", required: true}, "keyCount": {type: "number"}})
                expect(createdTemplate.tags).toEqual(["test", "example"])
                expect(createdTemplate.description).toBe("Test template description")

                expect(Object.isFrozen(createdTemplate.fields)).toBe(true)
            })

            test("Upload a template and check correctness of the parsed fields", () => {
                const result = builder.fromTemplate(template).build()
                expect(result).toEqual({
                    "name": {type: "string", required: true, defaultValue: "unknown"},
                    "surname": {type: "string", required: true, defaultValue: "unknown"},
                    "age": {type: "number", defaultValue: 0},
                })
            })

            test("Update the template and check updates accomplished", () => {
                const testStartTime = new Date()
                const updatedTemplate = builder
                    .fromTemplate(template)
                    .updateTemplate(template, {"name": "updatedName", "id": "changedId"})

                expect(updatedTemplate.id).toBe("changedId")
                expect(updatedTemplate.name).toBe("updatedName")
                expect(updatedTemplate.lastUpdatedAt.getTime()).toBeGreaterThanOrEqual(testStartTime.getTime())
            })
        })

        describe("Negative tests", () => {
            test("Create template with no fields", () => {
                const templateData: Omit<Template, "fields" | "lastUpdatedAt"> = {
                    id: "test-id",
                    name: "test-template",
                    createdAt: new Date(),
                    tags: []
                }

                expect(() => {
                    builder.toTemplate(templateData)
                }).toThrow("Validation failed Builder has no fields defined")
            })

            test("Update template with no fields", () => {
                const template: Template = {
                    id: "test-id",
                    name: "test-template",
                    createdAt: new Date(),
                    lastUpdatedAt: new Date(),
                    tags: [],
                    fields: {"testField": {type: "string"}}
                }

                expect(() => {
                    builder.updateTemplate(template, {name: "updated"})
                }).toThrow("Validation failed Builder has no fields defined")
            })
        })
    })
})