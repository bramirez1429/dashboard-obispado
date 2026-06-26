"use client";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
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
import styles from "./WardStakeAffairsList.module.css";

type AddableSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  initialOptions: string[];
};

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

const WardStakeAffairsList = () => (
  <Form.List name="wardStakeAffairs">
    {(fields, { add, remove }) => (
      <Space className={styles.list} orientation="vertical" size={12}>
        {fields.map((field) => (
          <div className={styles.item} key={field.key}>
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
        ))}

        <Button
          icon={<PlusOutlined />}
          onClick={() => add(emptyAffair)}
          type="dashed"
        >
          Agregar asunto
        </Button>
      </Space>
    )}
  </Form.List>
);

export default WardStakeAffairsList;
