"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Checkbox, Collapse, Empty } from "antd";
import type { MeetingMinute } from "@/components/meeting-minutes/MeetingMinuteView";

type ChecklistSection = {
  key: string;
  title: string;
  children: ReactNode;
};

type AdminMeetingMinuteViewProps = {
  minute?: MeetingMinute | null;
};

const getText = (value?: string) => (value?.trim() ? value : "-");

const getHymnText = (hymn?: MeetingMinute["firstHymn"]) => {
  if (!hymn?.number && !hymn?.title) {
    return "-";
  }

  if (hymn.number && hymn.title) {
    return `${hymn.number} - ${hymn.title}`;
  }

  return hymn.number || hymn.title || "-";
};

const getAnnouncementItems = (announcements?: string) =>
  announcements?.split(/\r?\n/).filter((announcement) => announcement.trim()) ??
  [];

const getBusinesses = (business?: MeetingMinute["wardAndStakeBusiness"]) => {
  const businesses = Array.isArray(business) ? business : [business];

  return businesses.filter(Boolean).map((item, index) => ({
    key: `${item?.subject ?? ""}-${item?.name ?? ""}-${index}`,
    title:
      item?.subject && item?.name
        ? `${item.subject} de ${item.name}`
        : item?.subject || item?.name || "-",
    details: item?.details || "",
  }));
};

const FieldLine = ({ label, value }: { label: string; value: ReactNode }) => (
  <div style={{ display: "grid", gap: 4 }}>
    <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
    <span style={{ lineHeight: 1.5, overflowWrap: "anywhere" }}>
      {value || "-"}
    </span>
  </div>
);

const AdminMinuteModule = ({
  section,
  completed,
  onComplete,
}: {
  section: ChecklistSection;
  completed: boolean;
  onComplete: (sectionKey: string) => void;
}) => ({
  key: section.key,
  label: (
    <span style={{ alignItems: "center", display: "inline-flex", gap: 10 }}>
      <Checkbox
        checked={completed}
        onChange={(event) => {
          event.stopPropagation();
          onComplete(section.key);
        }}
        onClick={(event) => event.stopPropagation()}
      />
      <span>{section.title}</span>
    </span>
  ),
  children: section.children,
});

const AdminChecklistStyles = () => (
  <style>{`
    .admin-minute-collapse {
      background: transparent;
      border: 0;
    }

    .admin-minute-collapse > .ant-collapse-item {
      margin-bottom: 12px;
      overflow: hidden;
      background: #f8fafc;
      border: 1px solid #d7e1ea !important;
      border-radius: 14px !important;
    }

    .admin-minute-collapse > .ant-collapse-item:last-child {
      margin-bottom: 0;
    }

    .admin-minute-collapse .ant-collapse-header {
      align-items: center !important;
      cursor: default !important;
      font-weight: 700;
    }

    .admin-minute-collapse .ant-collapse-expand-icon {
      cursor: pointer;
    }
  `}</style>
);

const buildSections = (minute: MeetingMinute): ChecklistSection[] => {
  const announcementItems = getAnnouncementItems(minute.announcements);
  const businesses = getBusinesses(minute.wardAndStakeBusiness);

  return [
    {
      key: "summary",
      title: "Resumen",
      children: (
        <div style={{ display: "grid", gap: 12 }}>
          <FieldLine label="Fecha" value={getText(minute.date)} />
          <FieldLine label="Preside" value={getText(minute.presides)} />
          <FieldLine label="Dirige" value={getText(minute.leads)} />
        </div>
      ),
    },
    {
      key: "welcome",
      title: "Bienvenida y reconocimientos",
      children: (
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {getText(minute.welcomeAndAcknowledgmentsOfAuthorities)}
        </p>
      ),
    },
    {
      key: "announcements",
      title: "Anuncios",
      children: announcementItems.length ? (
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          {announcementItems.map((announcement, index) => (
            <li key={`${announcement}-${index}`}>{announcement}</li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {getText(minute.announcements)}
        </p>
      ),
    },
    {
      key: "opening",
      title: "Inicio de la reunion",
      children: (
        <div style={{ display: "grid", gap: 12 }}>
          <FieldLine label="Primer himno" value={getHymnText(minute.firstHymn)} />
          <FieldLine label="Directora" value={getText(minute.director)} />
          <FieldLine label="Pianista" value={getText(minute.pianist)} />
          <FieldLine label="Primera oracion" value={getText(minute.openingPrayer)} />
        </div>
      ),
    },
    {
      key: "business",
      title: "Asuntos del barrio y estaca",
      children: businesses.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {businesses.map((business) => (
            <div key={business.key}>
              <strong>{business.title}</strong>
              {business.details ? (
                <p style={{ margin: "4px 0 0" }}>{business.details}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0 }}>-</p>
      ),
    },
    {
      key: "sacrament",
      title: "Himno sacramental",
      children: (
        <p style={{ margin: 0 }}>{getHymnText(minute.sacramentalHymn)}</p>
      ),
    },
    {
      key: "messages",
      title: "Mensajes",
      children: minute.messages?.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {minute.messages.map((message, index) => (
            <div key={`${message.name}-${index}`}>
              {message.name?.trim() ? <strong>{message.name}</strong> : null}
              <p style={{ margin: "4px 0 0" }}>{getText(message.topic)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0 }}>-</p>
      ),
    },
    {
      key: "closing",
      title: "Final de la reunion",
      children: (
        <div style={{ display: "grid", gap: 12 }}>
          <FieldLine label="Ultimo himno" value={getHymnText(minute.lastHymn)} />
          <FieldLine label="Ultima oracion" value={getText(minute.closingPrayer)} />
        </div>
      ),
    },
  ];
};

export default function AdminMeetingMinuteView({
  minute,
}: AdminMeetingMinuteViewProps) {
  const sections = minute ? buildSections(minute) : [];
  const allModuleKeys = sections.map((section) => section.key);
  const [openModuleKeys, setOpenModuleKeys] = useState<string[]>(allModuleKeys);
  const [completedModuleKeys, setCompletedModuleKeys] = useState<string[]>([]);

  if (!minute) {
    return (
      <main style={{ minHeight: "100vh", padding: "32px 16px", background: "#eef3f7" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ borderRadius: 16, background: "#fff", padding: 32 }}>
            <Empty description="Todavia no hay una minuta guardada." />
          </div>
        </div>
      </main>
    );
  }

  const handleExpandAllModules = () => {
    setOpenModuleKeys(allModuleKeys);
  };

  const handleCollapseCompletedModules = () => {
    setOpenModuleKeys((currentKeys) =>
      currentKeys.filter((key) => !completedModuleKeys.includes(key))
    );
  };

  const handleToggleModule = (keys: string | string[]) => {
    setOpenModuleKeys(Array.isArray(keys) ? keys : [keys]);
  };

  const handleCompleteModule = (sectionKey: string) => {
    setCompletedModuleKeys((currentKeys) => {
      if (currentKeys.includes(sectionKey)) {
        setOpenModuleKeys((openKeys) =>
          openKeys.includes(sectionKey) ? openKeys : [...openKeys, sectionKey]
        );

        return currentKeys.filter((key) => key !== sectionKey);
      }

      setOpenModuleKeys((openKeys) =>
        openKeys.filter((key) => key !== sectionKey)
      );

      return [...currentKeys, sectionKey];
    });
  };

  return (
    <main style={{ minHeight: "100vh", padding: "32px 16px", background: "#eef3f7" }}>
      <div className="admin-minute-checklist" style={{ maxWidth: 980, margin: "0 auto" }}>
        <AdminChecklistStyles />
        <article style={{ borderRadius: 22, background: "#fff", padding: "24px 18px" }}>
          <header style={{ marginBottom: 18, textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#3880c7", fontSize: 36 }}>
              Reunion Sacramental
            </h1>
          </header>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 12 }}>
            <Button size="small" onClick={handleExpandAllModules}>
              Desplegar todo
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={handleCollapseCompletedModules}
            >
              Comprimir chequeados
            </Button>
          </div>
          <Collapse
            activeKey={openModuleKeys}
            className="admin-minute-collapse"
            collapsible="icon"
            expandIcon={({ isActive }) =>
              isActive ? <DownOutlined /> : <RightOutlined />
            }
            items={sections.map((section) =>
              AdminMinuteModule({
                section,
                completed: completedModuleKeys.includes(section.key),
                onComplete: handleCompleteModule,
              })
            )}
            onChange={handleToggleModule}
          />
        </article>
      </div>
    </main>
  );
}
