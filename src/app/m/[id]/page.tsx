import { Card } from "antd";
import { MessagePreviewCard } from "@/components/discursos/MessagePreviewCard";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export default async function PublicMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="public-message-page">
      <Card className="public-message-card">
        <div className="public-message-heading">
          <span className="public-message-eyebrow">Obispado</span>
          <Title level={2} style={{ marginTop: 0 }}>
            Asignación de discurso
          </Title>
          <Paragraph type="secondary">
            Esta es una vista pública de solo lectura para el hermano asignado.
          </Paragraph>
        </div>

        <MessagePreviewCard
          id={id}
          hermano="Hermano de ejemplo"
          tema="Fe en Jesucristo"
          fecha="Domingo 7 de junio de 2026"
          referencias="Mosiah 3:17; 2 Nefi 31:20; discurso de conferencia sugerido."
          instrucciones="Preparar un mensaje centrado en el Salvador, con una duración aproximada de 10 minutos."
          status="Compartido"
        />
      </Card>
    </main>
  );
}
