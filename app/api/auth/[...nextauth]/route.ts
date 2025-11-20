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
      // 初回サインイン時のみ会員チェック（レート制限対策）
      if (account && profile) {
        token.accessToken = account.access_token;
        token.discordId = profile.id;

        try {
          const guildId = process.env.DISCORD_GUILD_ID!;
          const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID!;

          // 初回認証時のみAPIコール
          const isMember = await isSkillFreakMember(
            account.access_token as string,
            guildId,
            memberRoleId
          );

          token.isMember = isMember;
        } catch (error: any) {
          console.error('Discord member check failed:', error.message);
          // レート制限エラー等の場合はデフォルトでfalse
          token.isMember = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // トークンからキャッシュされた情報を読み取るだけ（APIコールなし）
        session.user = {
          ...session.user,
          id: token.discordId as string,
          isMember: token.isMember as boolean || false,
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
