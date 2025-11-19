/**
 * NextAuth Discord OAuth2設定
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { isSkillFreakMember } from '@/lib/discord-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds guilds.members.read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.discordId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.accessToken) {
        const guildId = process.env.DISCORD_GUILD_ID!;
        const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID!;

        // SkillFreak会員かチェック
        const isMember = await isSkillFreakMember(
          token.accessToken as string,
          guildId,
          memberRoleId
        );

        session.user = {
          ...session.user,
          id: token.discordId as string,
          isMember,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
