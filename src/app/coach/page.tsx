import { listMessages } from "@/db/messages";
import { PageHeader } from "@/components/page-header";
import { ChatPanel } from "@/components/chat-panel";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const messages = await listMessages();

  return (
    <div className="min-h-full">
      <PageHeader
        numeral="V"
        title="Coach"
        description="Ton profil, ton équipement et ta progression sont déjà connus du coach — dis-lui simplement ce que tu as comme temps aujourd'hui."
      />
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <ChatPanel initialMessages={messages} />
      </div>
    </div>
  );
}
