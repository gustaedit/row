import React, { useState, useEffect } from "react";
import axios from "axios";

interface Row {
  id: number;
  name: string;
  img?: string;
}

interface Response {
  success: boolean;
  data: Row[];
}

const ListaOlimpiadas: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Response>("https://app.olimpiadas.app/teste");
        setRows(response.data.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const getMediaType = (url: string | undefined): "image" | "video" | "site" => {
    if (!url) {
      return "site";
    }

    if (url.toLowerCase().endsWith(".jpeg") || url.toLowerCase().endsWith(".jpg")) {
      return "image";
    }

    if (url.includes("youtube.com")) {
      return "video";
    }

    return "site";
  };

  const extractVideoId = (url: string | undefined): string | undefined =>
    url &&
    (url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ||
      url.match(/i3\.ytimg\.com\/vi\/\s*([a-zA-Z0-9_-]+)\s*\/maxresdefault\.jpg/)?.[1]);

  const generateThumbnailUrl = (videoId: string | undefined): string | undefined =>
    videoId && `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const handleThumbnailClick = (videoId: string) => setPlayingVideoId(videoId);
  const handleVideoEnd = () => setPlayingVideoId(null);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Lista de Conteúdos</h1>
      {rows.length === 0 && <p style={{ textAlign: "center" }}>Carregando...</p>}
      {rows.map((row) => (
        <div key={row.id} style={{ margin: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h2>{row.name}</h2>
          {row.img && !playingVideoId && (
            <>
              {getMediaType(row.img) === "image" && (
                <img
                  src={row.img}
                  alt={row.name}
                  style={{ width: "100%", height: "auto", display: "block", margin: "0 auto", cursor: "pointer" }}
                />
              )}
              {getMediaType(row.img) === "video" && (
                <img
                  src={generateThumbnailUrl(extractVideoId(row.img))}
                  alt={row.name}
                  style={{ width: "100%", height: "auto", display: "block", margin: "0 auto", cursor: "pointer" }}
                  onClick={() => handleThumbnailClick(extractVideoId(row.img) || "")}
                />
              )}
              {getMediaType(row.img) === "site" && (
                <a href={row.img} target="_blank" rel="noopener noreferrer">
                  Visitar Site
                </a>
              )}
            </>
          )}
          {playingVideoId === extractVideoId(row.img) && (
            <iframe
              src={row.img}
              title={row.name}
              width="100%"
              height="300"
              style={{ display: "block", margin: "0 auto" }}
              allowFullScreen
              onEnded={handleVideoEnd}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ListaOlimpiadas;
