import { render, screen } from "@testing-library/react";
import PublicMessageCard from "@/components/speeches/PublicMessageCard";

const baseSpeech = {
  id: "speech-1",
  name: "Juan Pérez",
  gender: "masculine",
  date: "2026-06-14",
  speech: "La fe en Jesucristo",
  time: 10,
  references: "",
};

describe("PublicMessageCard", () => {
  test('renderiza "Hermano" para un discurso masculino', () => {
    render(<PublicMessageCard speech={baseSpeech} />);

    expect(screen.getByText("Hermano")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  test('renderiza "Hermana" para un discurso femenino', () => {
    render(
      <PublicMessageCard
        speech={{ ...baseSpeech, name: "María Gómez", gender: "feminine" }}
      />,
    );

    expect(screen.getByText("Hermana")).toBeInTheDocument();
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
  });
});
