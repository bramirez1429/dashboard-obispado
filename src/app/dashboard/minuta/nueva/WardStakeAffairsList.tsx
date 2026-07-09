"use client";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  type InputRef,
} from "antd";
import { useRef, useState } from "react";
import SortableItem from "./SortableItem";
import styles from "./WardStakeAffairsList.module.css";

type AddableSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  initialOptions: string[];
};

type WardStakeAffair = {
  id?: string | number;
  interviewId?: string | number;
  tempId?: string;
  type?: string;
  customType?: string;
  name?: string;
  calling?: string;
  customCalling?: string;
};

const getWardBusinessSortableId = (
  item: WardStakeAffair,
  index: number
) => String(item.id || item.interviewId || item.tempId || `ward-${index}`);

const affairOptions = ["Sostenimiento", "Relevo"];

const detailOptions = [
  "Obispo",
  "Primer consejero del obispado",
  "Segundo consejero del obispado",
  "Secretario de barrio",
  "Secretario ejecutivo",
  "Secretario financiero",
  "Presidente del cuórum de élderes",
  "Consejero del cuórum de élderes",
  "Presidenta de la Sociedad de Socorro",
  "Consejera de la Sociedad de Socorro",
  "Presidenta de Mujeres Jóvenes",
  "Consejera de Mujeres Jóvenes",
  "Presidenta de Primaria",
  "Consejera de Primaria",
  "Presidente de Escuela Dominical",
  "Líder misional de barrio",
  "Consultor de templo e historia familiar",
  "Director de música",
  "Pianista",
  "Maestro",
  "Bibliotecario",
];

const emptyAffair = {
  type: "Sostenimiento",
  name: "",
  calling: undefined,
};

const AddableSelect = ({
  value,
  onChange,
  placeholder,
  initialOptions,
}: AddableSelectProps) => {
  const inputRef = useRef<InputRef>(null);
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState(initialOptions);

  const handleAddOption = () => {
    const trimmedOption = newOption.trim();

    if (!trimmedOption) return;

    setOptions((currentOptions) =>
      currentOptions.includes(trimmedOption)
        ? currentOptions
        : [...currentOptions, trimmedOption]
    );
    onChange?.(trimmedOption);
    setNewOption("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options.map((option) => ({
        value: option,
        label: option,
      }))}
      optionFilterProp="label"
      placeholder={placeholder}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider className={styles.selectDivider} />
          <Space className={styles.addOptionRow}>
            <Input
              ref={inputRef}
              value={newOption}
              placeholder="Agregar opcion"
              onChange={(event) => setNewOption(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddOption}
              type="text"
            >
              Agregar
            </Button>
          </Space>
        </>
      )}
      showSearch
    />
  );
};

const WardStakeAffairsList = () => {
  const form = Form.useFormInstance();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    })
  );

  const handleWardBusinessDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const currentItems: WardStakeAffair[] =
      form.getFieldValue("wardStakeAffairs") || [];
    const oldIndex = currentItems.findIndex(
      (item, index) =>
        getWardBusinessSortableId(item, index) === String(active.id)
    );
    const newIndex = currentItems.findIndex(
      (item, index) =>
        getWardBusinessSortableId(item, index) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    form.setFieldsValue({
      wardStakeAffairs: arrayMove(currentItems, oldIndex, newIndex),
    });
  };

  return (
    <Form.List name="wardStakeAffairs">
      {(fields, { add, remove }) => {
        const currentItems: WardStakeAffair[] =
          form.getFieldValue("wardStakeAffairs") || [];
        const sortableIds = fields.map((_, index) =>
          getWardBusinessSortableId(currentItems[index] || {}, index)
        );

        return (
          <Space className={styles.list} orientation="vertical" size={12}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleWardBusinessDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => {
                  const sortableId = sortableIds[index];

                  return (
                    <SortableItem key={sortableId} id={sortableId}>
                      <div className={styles.item}>
            <Form.Item name={[field.name, "interviewId"]} hidden>
              <Input />
            </Form.Item>
            <Row align="top" gutter={[12, 0]}>
              <Col xs={24} md={7}>
                <Form.Item label="Asunto" name={[field.name, "type"]}>
                  <AddableSelect
                    initialOptions={affairOptions}
                    placeholder="Seleccionar asunto"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={7}>
                <Form.Item label="Nombre" name={[field.name, "name"]}>
                  <Input placeholder="Nombre de la persona" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Detalle" name={[field.name, "calling"]}>
                  <AddableSelect
                    initialOptions={detailOptions}
                    placeholder="Seleccionar detalle"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={2}>
                <Button
                  aria-label="Eliminar asunto"
                  className={styles.removeButton}
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(field.name)}
                />
              </Col>
            </Row>
                      </div>
                    </SortableItem>
                  );
                })}
              </SortableContext>
            </DndContext>

            <Button
              icon={<PlusOutlined />}
              onClick={() =>
                add({ ...emptyAffair, tempId: crypto.randomUUID() })
              }
              type="dashed"
            >
              Agregar asunto
            </Button>
          </Space>
        );
      }}
    </Form.List>
  );
};

export default WardStakeAffairsList;
