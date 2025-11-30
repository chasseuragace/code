const { ESLintUtils } = require('@typescript-eslint/utils');

/**
 * ESLint rule to enforce DTO decorator requirements
 * 
 * This rule ensures that:
 * 1. All DTO properties have @ApiProperty or @ApiPropertyOptional
 * 2. Optional properties use @ApiPropertyOptional
 * 3. Request DTOs have class-validator decorators
 * 4. Decorators have proper metadata (description, examples)
 */

module.exports = ESLintUtils.RuleCreator(() => '')({
  name: 'require-dto-decorators',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure DTO properties have proper Swagger and class-validator decorators',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          requireDescriptions: {
            type: 'boolean',
            default: true,
          },
          requireExamples: {
            type: 'boolean',
            default: false,
          },
          requireValidators: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingSwaggerDecorator: 'Property "{{name}}" must have @ApiProperty or @ApiPropertyOptional decorator',
      wrongDecoratorForOptional: 'Optional property "{{name}}" must use @ApiPropertyOptional instead of @ApiProperty',
      wrongDecoratorForRequired: 'Required property "{{name}}" must use @ApiProperty instead of @ApiPropertyOptional',
      missingDescription: '@ApiProperty for "{{name}}" must include a description',
      missingExample: '@ApiProperty for "{{name}}" should include an example value',
      missingValidator: 'Property "{{name}}" in request DTO must have class-validator decorator',
      missingIsOptional: 'Optional property "{{name}}" must have @IsOptional decorator',
      missingIsArray: 'Array property "{{name}}" must have @IsArray decorator',
      missingValidateNested: 'Nested object property "{{name}}" must have @ValidateNested and @Type decorators',
      invalidDtoName: 'DTO class name must end with "Dto" suffix',
      invalidResponseDtoName: 'Response DTO class name should include "Response"',
      invalidRequestDtoName: 'Request DTO class name should include "Create", "Update", or "Query"',
      dtoNotInDtoDirectory: 'DTO file must be in a dto/ directory',
    },
  },
  defaultOptions: [
    {
      requireDescriptions: true,
      requireExamples: false,
      requireValidators: true,
    },
  ],
  create(context) {
    const options = context.options[0] || {};
    const sourceCode = context.getSourceCode();
    const filename = context.getFilename();

    // Helper: Check if class is a DTO
    function isDtoClass(node) {
      return node.id && node.id.name.endsWith('Dto');
    }

    // Helper: Check if file is in dto/ directory
    function isInDtoDirectory() {
      return filename.includes('/dto/');
    }

    // Helper: Check if property is optional
    function isOptionalProperty(node) {
      return node.optional || hasDecorator(node, 'IsOptional');
    }

    // Helper: Check if node has specific decorator
    function hasDecorator(node, decoratorName) {
      if (!node.decorators) return false;
      return node.decorators.some(dec => {
        const expr = dec.expression;
        if (expr.type === 'CallExpression') {
          return expr.callee.name === decoratorName;
        }
        return expr.name === decoratorName;
      });
    }

    // Helper: Get decorator by name
    function getDecorator(node, decoratorName) {
      if (!node.decorators) return null;
      return node.decorators.find(dec => {
        const expr = dec.expression;
        if (expr.type === 'CallExpression') {
          return expr.callee.name === decoratorName;
        }
        return expr.name === decoratorName;
      });
    }

    // Helper: Check if decorator has description
    function hasDescription(decorator) {
      if (!decorator || decorator.expression.type !== 'CallExpression') return false;
      const args = decorator.expression.arguments;
      if (args.length === 0) return false;
      const options = args[0];
      if (options.type !== 'ObjectExpression') return false;
      return options.properties.some(prop => 
        prop.key && prop.key.name === 'description' && 
        prop.value && prop.value.type === 'Literal' && 
        prop.value.value && prop.value.value.trim().length > 0
      );
    }

    // Helper: Check if decorator has example
    function hasExample(decorator) {
      if (!decorator || decorator.expression.type !== 'CallExpression') return false;
      const args = decorator.expression.arguments;
      if (args.length === 0) return false;
      const options = args[0];
      if (options.type !== 'ObjectExpression') return false;
      return options.properties.some(prop => prop.key && prop.key.name === 'example');
    }

    // Helper: Infer TypeScript type from type annotation
    function inferType(node) {
      if (!node.typeAnnotation || !node.typeAnnotation.typeAnnotation) return 'unknown';
      const typeNode = node.typeAnnotation.typeAnnotation;
      
      if (typeNode.type === 'TSStringKeyword') return 'string';
      if (typeNode.type === 'TSNumberKeyword') return 'number';
      if (typeNode.type === 'TSBooleanKeyword') return 'boolean';
      if (typeNode.type === 'TSArrayType') return 'array';
      if (typeNode.type === 'TSTypeReference') {
        if (typeNode.typeName.name === 'Date') return 'Date';
        return 'object';
      }
      if (typeNode.type === 'TSUnionType') {
        // Check if it's a nullable type (type | null)
        const hasNull = typeNode.types.some(t => t.type === 'TSNullKeyword');
        if (hasNull && typeNode.types.length === 2) {
          const nonNullType = typeNode.types.find(t => t.type !== 'TSNullKeyword');
          if (nonNullType) {
            if (nonNullType.type === 'TSStringKeyword') return 'string';
            if (nonNullType.type === 'TSNumberKeyword') return 'number';
            if (nonNullType.type === 'TSBooleanKeyword') return 'boolean';
          }
        }
      }
      
      return 'unknown';
    }

    // Helper: Check if type is array
    function isArrayType(node) {
      if (!node.typeAnnotation || !node.typeAnnotation.typeAnnotation) return false;
      return node.typeAnnotation.typeAnnotation.type === 'TSArrayType';
    }

    // Helper: Check if type is object (not primitive)
    function isObjectType(node) {
      if (!node.typeAnnotation || !node.typeAnnotation.typeAnnotation) return false;
      const typeNode = node.typeAnnotation.typeAnnotation;
      return typeNode.type === 'TSTypeReference' && typeNode.typeName.name !== 'Date';
    }

    // Helper: Check if DTO is likely a request DTO
    function isRequestDto(className) {
      return className.includes('Create') || 
             className.includes('Update') || 
             className.includes('Query') ||
             className.includes('Input');
    }

    // Helper: Check if DTO is likely a response DTO
    function isResponseDto(className) {
      return className.includes('Response') || className.includes('Output');
    }

    return {
      ClassDeclaration(node) {
        // Check if this is a DTO class
        if (!isDtoClass(node)) return;

        const className = node.id.name;

        // Validate DTO naming conventions
        if (!className.endsWith('Dto')) {
          context.report({
            node: node.id,
            messageId: 'invalidDtoName',
          });
        }

        // Validate file location
        if (!isInDtoDirectory()) {
          context.report({
            node: node.id,
            messageId: 'dtoNotInDtoDirectory',
          });
        }

        // Validate naming patterns for request/response DTOs
        if (isRequestDto(className) && !isResponseDto(className)) {
          // Request DTO - should have Create/Update/Query
          if (!className.match(/Create|Update|Query/)) {
            context.report({
              node: node.id,
              messageId: 'invalidRequestDtoName',
            });
          }
        } else if (isResponseDto(className)) {
          // Response DTO - should have Response
          if (!className.includes('Response')) {
            context.report({
              node: node.id,
              messageId: 'invalidResponseDtoName',
            });
          }
        }

        const isRequest = isRequestDto(className);

        // Check each property in the DTO
        node.body.body.forEach(member => {
          if (member.type !== 'PropertyDefinition') return;
          if (!member.key || !member.key.name) return;

          const propertyName = member.key.name;
          const isOptional = isOptionalProperty(member);
          const isArray = isArrayType(member);
          const isObject = isObjectType(member);
          const inferredType = inferType(member);

          // Check for Swagger decorators
          const hasApiProperty = hasDecorator(member, 'ApiProperty');
          const hasApiPropertyOptional = hasDecorator(member, 'ApiPropertyOptional');
          const hasSwaggerDecorator = hasApiProperty || hasApiPropertyOptional;

          if (!hasSwaggerDecorator) {
            context.report({
              node: member,
              messageId: 'missingSwaggerDecorator',
              data: { name: propertyName },
              fix(fixer) {
                const decoratorName = isOptional ? '@ApiPropertyOptional' : '@ApiProperty';
                const description = `${propertyName.replace(/_/g, ' ')}`;
                const exampleValue = inferredType === 'string' ? `'example'` : 
                                   inferredType === 'number' ? '0' :
                                   inferredType === 'boolean' ? 'true' : 
                                   'null';
                const decorator = `${decoratorName}({ description: '${description}', example: ${exampleValue} })\n  `;
                return fixer.insertTextBefore(member, decorator);
              },
            });
          } else {
            // Validate correct decorator for optionality
            if (isOptional && hasApiProperty && !hasApiPropertyOptional) {
              context.report({
                node: member,
                messageId: 'wrongDecoratorForOptional',
                data: { name: propertyName },
              });
            } else if (!isOptional && hasApiPropertyOptional && !hasApiProperty) {
              context.report({
                node: member,
                messageId: 'wrongDecoratorForRequired',
                data: { name: propertyName },
              });
            }

            // Check for description if required
            if (options.requireDescriptions) {
              const swaggerDecorator = getDecorator(member, 'ApiProperty') || 
                                      getDecorator(member, 'ApiPropertyOptional');
              if (swaggerDecorator && !hasDescription(swaggerDecorator)) {
                context.report({
                  node: member,
                  messageId: 'missingDescription',
                  data: { name: propertyName },
                });
              }
            }

            // Check for example if required
            if (options.requireExamples) {
              const swaggerDecorator = getDecorator(member, 'ApiProperty') || 
                                      getDecorator(member, 'ApiPropertyOptional');
              if (swaggerDecorator && !hasExample(swaggerDecorator)) {
                context.report({
                  node: member,
                  messageId: 'missingExample',
                  data: { name: propertyName },
                });
              }
            }
          }

          // Check for class-validator decorators (only for request DTOs)
          if (isRequest && options.requireValidators) {
            const hasValidator = hasDecorator(member, 'IsString') ||
                               hasDecorator(member, 'IsNumber') ||
                               hasDecorator(member, 'IsBoolean') ||
                               hasDecorator(member, 'IsDate') ||
                               hasDecorator(member, 'IsArray') ||
                               hasDecorator(member, 'IsObject') ||
                               hasDecorator(member, 'IsEnum') ||
                               hasDecorator(member, 'IsEmail') ||
                               hasDecorator(member, 'IsUrl') ||
                               hasDecorator(member, 'IsUUID') ||
                               hasDecorator(member, 'ValidateNested') ||
                               hasDecorator(member, 'IsOptional');

            if (!hasValidator) {
              context.report({
                node: member,
                messageId: 'missingValidator',
                data: { name: propertyName },
              });
            }

            // Check for @IsOptional on optional properties
            if (isOptional && !hasDecorator(member, 'IsOptional')) {
              context.report({
                node: member,
                messageId: 'missingIsOptional',
                data: { name: propertyName },
              });
            }

            // Check for @IsArray on array properties
            if (isArray && !hasDecorator(member, 'IsArray')) {
              context.report({
                node: member,
                messageId: 'missingIsArray',
                data: { name: propertyName },
              });
            }

            // Check for @ValidateNested on object properties
            if (isObject && !hasDecorator(member, 'ValidateNested')) {
              context.report({
                node: member,
                messageId: 'missingValidateNested',
                data: { name: propertyName },
              });
            }
          }
        });
      },
    };
  },
});
