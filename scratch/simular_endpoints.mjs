import postgres from "postgres";

const dbReadonly = postgres({
  host: process.env.READONLY_DB_HOST || "172.20.10.205",
  port: Number(process.env.READONLY_DB_PORT) || 5432,
  database: process.env.READONLY_DB_NAME || "torre_controle",
  username: process.env.READONLY_DB_USER || "torre_vw",
  password: process.env.READONLY_DB_PASSWORD || "!Epc#Torre2@",
  max: 2,
  connect_timeout: 10,
});

async function main() {
  const termo = "1808947";
  console.log("=== SIMULANDO buscarMinuta ===");
  let minutaIds = [];
  const termoNum = Number(termo);
  const isNum = !isNaN(termoNum) && termoNum > 0;

  const porMinutaOuCte = await dbReadonly`
    SELECT m.id_minuta
    FROM minuta m
    WHERE ${isNum ? dbReadonly`m.id_minuta = ${termoNum} OR m.cte_numero = ${termoNum}` : dbReadonly`FALSE`}
       OR m.cte_numero::text = ${termo}
    ORDER BY m.id_minuta DESC
    LIMIT 10
  `;
  minutaIds.push(...porMinutaOuCte.map((r) => Number(r.id_minuta)).filter(Boolean));
  console.log("minutaIds:", minutaIds);

  const minutas = await dbReadonly`
    SELECT 
      m.id_minuta,
      m.cte_numero,
      m.status,
      m.total_volumes,
      m.prev_entrega,
      COALESCE(
        ro.rota,
        (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
        m.origem
      ) AS origem_nome,
      COALESCE(
        rd.rota,
        (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
        m.destino
      ) AS destino_nome,
      r.rota AS rota_nome
    FROM minuta m
    LEFT JOIN rotas r ON m.rota::text = r.id::text
    LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
    LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
    WHERE m.id_minuta = ANY(${minutaIds})
    ORDER BY m.id_minuta DESC
  `;
  console.log("minutas encontradas:", minutas);

  console.log("\n=== SIMULANDO obterDetalhesInvestigacao para 1808947 ===");
  const idMinuta = 1808947;

  // 1. Minuta
  const [minutaRow] = await dbReadonly`
    SELECT 
      m.id_minuta,
      m.cte_numero,
      m.status,
      m.total_volumes,
      m.prev_entrega,
      COALESCE(
        ro.rota,
        (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
        m.origem
      ) AS origem_nome,
      COALESCE(
        rd.rota,
        (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
        m.destino
      ) AS destino_nome,
      r.rota AS rota_nome
    FROM minuta m
    LEFT JOIN rotas r ON m.rota::text = r.id::text
    LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
    LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
    WHERE m.id_minuta = ${idMinuta}
    LIMIT 1
  `;
  console.log("minutaRow:", minutaRow);

  // 2. Ocorrencias
  const ocorrencias = await dbReadonly`
    SELECT 
      f.id,
      f.frete AS id_minuta,
      f.status AS id_oco,
      t.descricao AS descricao,
      f.created_at AS data_evento
    FROM frete_hist f
    LEFT JOIN tipo_oco t ON t.id_oco = f.status
    WHERE f.frete = ${idMinuta}
    ORDER BY f.created_at DESC, f.id DESC
  `;
  console.log("ocorrencias:", ocorrencias);

  // 3. Volumes
  const volumesCadastrados = await dbReadonly`
    SELECT 
      v.id_volume,
      v.barras,
      v.parcial
    FROM volumes v
    WHERE v.id_minuta = ${idMinuta}
    ORDER BY v.parcial ASC NULLS LAST, v.id_volume ASC
  `;
  console.log("volumesCadastrados:", volumesCadastrados);

  const listaBarras = volumesCadastrados.map(v => String(v.barras));
  console.log("listaBarras:", listaBarras);

  // 4. Movimentações Brudam
  console.log("Consultando historico_volume...");
  const histRows = await dbReadonly`
    SELECT 
      h.id,
      h.barra,
      h.data,
      h.tipo AS h_tipo,
      h.manifesto,
      p.unidade AS picking_unidade,
      u.fantasia AS unidade_nome,
      u.sigla AS unidade_sigla,
      man.base AS manifesto_base,
      man.status AS manifesto_status,
      vec.placa AS veiculo_placa
    FROM historico_volume h
    LEFT JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
    LEFT JOIN unidades u ON p.unidade = u.id_unidade
    LEFT JOIN manifesto man ON h.manifesto = man.id_manifesto
    LEFT JOIN veiculos vec ON (man.veiculo = vec.id_veiculo OR man.veiculo_terceiro = vec.id_veiculo)
    WHERE h.barra = ANY(${listaBarras})
    ORDER BY h.data ASC, h.id ASC
  `;
  console.log("histRows encontrados:", histRows.length);

  await dbReadonly.end();
}

main().catch(err => {
  console.error("ERRO NO BACKEND:", err);
  process.exit(1);
});
