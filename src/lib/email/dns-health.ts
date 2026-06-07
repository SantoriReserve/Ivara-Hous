export type DnsHealthCheck = {
  name: string;
  pass: boolean;
  detail: string;
};

type DnsAnswer = { data?: string };

async function resolveTxt(name: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { Answer?: DnsAnswer[] };
    return (payload.Answer ?? [])
      .map((answer) => answer.data ?? "")
      .map((record) => record.replace(/^"|"$/g, "").replace(/"/g, ""));
  } catch {
    return [];
  }
}

export async function checkEmailDnsHealth(): Promise<DnsHealthCheck[]> {
  const [rootTxt, sendTxt, dmarcTxt, dkimTxt] = await Promise.all([
    resolveTxt("ivarahous.com"),
    resolveTxt("send.ivarahous.com"),
    resolveTxt("_dmarc.ivarahous.com"),
    resolveTxt("resend._domainkey.ivarahous.com"),
  ]);

  const rootSpf = rootTxt.find((record) => record.toLowerCase().startsWith("v=spf1"));
  const sendSpf = sendTxt.find((record) => record.toLowerCase().startsWith("v=spf1"));
  const spfRecord = rootSpf ?? sendSpf;
  const spfIncludesSes = Boolean(spfRecord?.toLowerCase().includes("amazonses.com"));
  const dmarcRecord = dmarcTxt.find((record) => record.toLowerCase().startsWith("v=dmarc1"));
  const dkimPresent = dkimTxt.length > 0;

  return [
    {
      name: "SPF record (root or send)",
      pass: Boolean(spfRecord),
      detail: rootSpf
        ? `ivarahous.com: ${rootSpf}`
        : sendSpf
          ? `send.ivarahous.com: ${sendSpf} (add SPF to root for info@ivarahous.com alignment)`
          : "No SPF TXT record found on ivarahous.com or send.ivarahous.com",
    },
    {
      name: "SPF includes Resend/SES",
      pass: spfIncludesSes,
      detail: spfIncludesSes
        ? "SPF authorizes Amazon SES (Resend)"
        : "SPF does not include amazonses.com — Resend deliverability may fail",
    },
    {
      name: "DKIM (Resend)",
      pass: dkimPresent,
      detail: dkimPresent
        ? "resend._domainkey.ivarahous.com is configured"
        : "Resend DKIM record not found",
    },
    {
      name: "DMARC",
      pass: Boolean(dmarcRecord),
      detail: dmarcRecord ?? "No DMARC record found",
    },
  ];
}
