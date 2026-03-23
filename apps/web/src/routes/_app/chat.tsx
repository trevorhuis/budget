import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "../../components/chat-workspace";

export const Route = createFileRoute("/_app/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatWorkspace />;
}
