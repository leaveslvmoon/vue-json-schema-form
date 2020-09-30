/**
 * Created by Liu.Jun on 2020/4/21 9:24.
 */

import vueProps from '../props';

import { orderProperties, getUiOptions } from '../../common/formUtils';
import { computedCurPath } from '../../common/vueUtils';

import FieldGroupWrap from '../../fieldComponents/FieldGroupWrap';
import Widget from '../../fieldComponents/Widget';

// eslint-disable-next-line import/no-cycle
import SchemaField from '../SchemaField';

export default {
    name: 'ObjectField',
    props: {
        ...vueProps
    },
    methods: {
        isRequired(name) {
            const schema = this.schema;
            return Array.isArray(schema.required) && !!~schema.required.indexOf(name);
        }
    },
    render(h) {
        const self = this;
        const props = this.$props;
        const {
            schema,
            uiSchema,
            errorSchema,
        } = props;

        const {
            title, description, showTitle, showDescription, order, fieldClass, fieldAttrs, fieldStyle
        } = getUiOptions({
            schema,
            uiSchema
        });

        const properties = Object.keys(schema.properties || {});
        const orderedProperties = orderProperties(properties, order);

        // 递归参数
        const propertiesVNodeList = orderedProperties.map(name => h(
            SchemaField,
            {
                props: {
                    ...props,
                    schema: schema.properties[name],
                    uiSchema: uiSchema[name],
                    errorSchema: errorSchema[name],
                    required: self.isRequired(name),
                    curNodePath: computedCurPath(props.curNodePath, name)
                }
            }
        ));

        return h(
            FieldGroupWrap,
            {
                props: {
                    title,
                    description,
                    showTitle,
                    showDescription
                },
                class: fieldClass,
                attrs: fieldAttrs,
                style: fieldStyle
            },
            [
                h(
                    'template',
                    {
                        slot: 'default'
                    },
                    [
                        ...propertiesVNodeList,

                        // 插入一个Widget，校验 object组 - minProperties. maxProperties. oneOf 等需要外层校验的数据
                        this.needValidFieldGroup ? h(Widget, {
                            class: {
                                validateWidget: true,
                                'validateWidget-object': true
                            },
                            props: {
                                schema: Object.entries(self.$props.schema).reduce((preVal, [key, value]) => {
                                    if (
                                        self.$props.schema.additionalProperties === false
                                        || !['properties', 'id', '$id'].includes(key)
                                    ) preVal[key] = value;
                                    return preVal;
                                }, {}),
                                uiSchema,
                                errorSchema,
                                curNodePath: props.curNodePath,
                                rootFormData: props.rootFormData
                            }
                        }) : null
                    ]
                )
            ]
        );
    }
};
