import { ApolloClient, ApolloLink, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { ipc_checkPlayKeyExists, ipc_removePlayKeyFile, ipc_storePlayKeyFile } from "@dolphin/ipc";
import { PlayKey } from "@dolphin/types";
import { isDevelopment } from "common/constants";
import electronLog from "electron-log";
import firebase from "firebase";
import { GraphQLError } from "graphql";

const log = electronLog.scope("slippiBackend");

const httpLink = new HttpLink({ uri: process.env.SLIPPI_GRAPHQL_ENDPOINT });
const authLink = setContext(async () => {
  // The firebase ID token expires after 1 hour so we will update the header on all actions
  const user = firebase.auth().currentUser;
  if (!user) {
    log.error("User is not logged in...");
  }

  const token = user ? await user.getIdToken() : null;

  return {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  };
});
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error) => !!error,
  },
});
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      log.error(`Apollo GQL Error: Message: ${message}, Location: ${locations}, Path: ${path}`),
    );
  }
  if (networkError) {
    log.error(`Apollo Network Error: ${networkError}`);
  }
});

const apolloLink = ApolloLink.from([authLink, errorLink, retryLink, httpLink]);

const appVersion = __VERSION__;

const client = new ApolloClient({
  link: apolloLink,
  cache: new InMemoryCache(),
  name: "slippi-launcher",
  version: `${appVersion}${isDevelopment ? "-dev" : ""}`,
});

const getUserKeyQuery = gql`
  query getUserKeyQuery($fbUid: String) {
    getUser(fbUid: $fbUid) {
      displayName
      connectCode {
        code
      }
      private {
        playKey
      }
    }
    getLatestDolphin {
      version
    }
  }
`;

const renameUserMutation = gql`
  mutation RenameUser($fbUid: String!, $displayName: String!) {
    userRename(fbUid: $fbUid, displayName: $displayName) {
      displayName
    }
  }
`;

export const initNetplayMutation = gql`
  mutation InitNetplay($codeStart: String!) {
    userInitNetplay(codeStart: $codeStart) {
      fbUid
    }
  }
`;

const handleErrors = (errors: readonly GraphQLError[] | undefined) => {
  if (errors) {
    let errMsgs = "";
    errors.forEach((err) => {
      errMsgs += `${err.message}\n`;
    });
    throw new Error(errMsgs);
  }
};

export async function fetchPlayKey(): Promise<PlayKey> {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("User is not logged in.");
  }

  const res = await client.query({
    query: getUserKeyQuery,
    variables: {
      fbUid: user.uid,
    },
    fetchPolicy: "network-only",
  });

  handleErrors(res.errors);

  return {
    uid: user.uid,
    connectCode: res.data.getUser.connectCode.code,
    playKey: res.data.getUser.private.playKey,
    displayName: res.data.getUser.displayName,
    latestVersion: res.data.getLatestDolphin.version,
  };
}

export async function assertPlayKey(playKey: PlayKey) {
  const playKeyExistsResult = await ipc_checkPlayKeyExists.renderer!.trigger({});
  if (!playKeyExistsResult.result) {
    log.error("Error checking for play key.", playKeyExistsResult.errors);
    throw new Error("Error checking for play key");
  }

  if (playKeyExistsResult.result.exists) {
    return;
  }

  const storeResult = await ipc_storePlayKeyFile.renderer!.trigger({ key: playKey });
  if (!storeResult.result) {
    log.error("Error saving play key", storeResult.errors);
    throw new Error("Error saving play key");
  }
}

export async function deletePlayKey(): Promise<void> {
  const deleteResult = await ipc_removePlayKeyFile.renderer!.trigger({});
  if (!deleteResult.result) {
    log.error("Error deleting play key", deleteResult.errors);
    throw new Error("Error deleting play key");
  }
}

export async function changeDisplayName(name: string) {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("User is not logged in.");
  }

  const res = await client.mutate({ mutation: renameUserMutation, variables: { fbUid: user.uid, displayName: name } });

  handleErrors(res.errors);

  if (res.data.userRename.displayName !== name) {
    throw new Error("Could not change name.");
  }

  await user.updateProfile({ displayName: name });
}

export async function initNetplay(codeStart: string): Promise<void> {
  const res = await client.mutate({ mutation: initNetplayMutation, variables: { codeStart } });
  handleErrors(res.errors);
}
