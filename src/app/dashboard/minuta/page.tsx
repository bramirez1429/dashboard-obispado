import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export default function MinutaPage() {
  return (
    <div className="page-stack minute-page">
      <div className="page-heading">
        <Title level={2} style={{ margin: 0 }}>
          Minuta sacramental
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Completa la hoja como se verá al imprimir.
        </Paragraph>
      </div>

      <SacramentalMinuteSheet />
    </div>
  );
}
