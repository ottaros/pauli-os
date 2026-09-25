export type AgentMessage = { role: "user" | "assistant"; content: string };
export interface HouseAgentProvider {
  id: string;
  enabled: boolean;
  reply(messages: AgentMessage[]): Promise<string>;
}
// No provider, credential or paid request is bundled in this version.
export const houseAgent: HouseAgentProvider = {
  id: "disabled",
  enabled: false,
  async reply() {
    throw new Error("Conversas serão ativadas em uma próxima etapa.");
  },
};
