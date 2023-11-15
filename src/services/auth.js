import axios from 'axios';
import moment from 'moment-timezone';
import jsonwebtoken from 'jsonwebtoken';

import $apollo from './apollo';
import $amplitude from './amplitude';

import GetUserSetting from '@/gql/auth/GetUserSetting.gql';
import InsertUserSession from '@/gql/auth/InsertUserSession.gql';
import GetProfile from '@/gql/general/GetProfile.gql';
import RefreshToken from '@/gql/auth/RefreshToken.gql';

if (window.location.href.includes('onboarding/setnewpassword')) {
  localStorage.clear();
}

let userId = null;
let userSettings = null;

const getUserId = () => {
  if (!userId && localStorage.access_token) {
    const payload = jsonwebtoken.decode(localStorage.access_token);
    userId = payload.id;
  }
  return userId;
};

let me;

const getUser = async () => {
  console.info('Auth | getUser | begin');
  if (me) return me;
  const id = getUserId();
  if (id) {
    try {
      const { data } = await $apollo.query({
        query: GetProfile,
        variables: {
          id,
        },
      });
      me = data.user;
      $amplitude.initUser({ ...me })
      console.info('Auth | getUser | end', { me });
      return data.user;
    } catch (error) {
      console.error(error)
    }
  }

  return null;
};

const getUserSettings = async () => {
  const id = getUserId();
  if (userSettings) return userSettings;
  if (id) {
    const { data } = await $apollo.query({
      query: GetUserSetting,
      variables: {
        id,
      },
    });
    userSettings = data.get_user_settings;
    return userSettings;
  }
  return userSettings;
};

const registerUserSession = async () => {
  const appVersion = 'DESKTOP-WEB';
  await $apollo.mutate({
    mutation: InsertUserSession,
    variables: {
      appVersion,
      timeZone: moment.tz.guess(),
    },
  });
};
const refreshToken = async () => {
  const {
    data: { token },
  } = await $apollo.query({
    query: RefreshToken,
  });
  localStorage.access_token = token;
};

if (localStorage.access_token) {
  registerUserSession();
  refreshToken();
}

const setHeader = (token) => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const isLoggedIn = async () => {
  if (!localStorage.access_token) return false;
  const userdata = await getUser();
  return !!userdata;
};

const isLoggedInAsUser = async () => {
  if (!localStorage.access_token) return false;
  const userdata = await getUser();
  return !!userdata && userdata.role === 'USER';
};

const logout = () => {
  localStorage.removeItem('access_token');
};

const isAdmin = () => {
  const authorizedAdmins = [
    '3954ee24-5dd1-4b0e-b29a-42bdd750fbc8', // @clouthub
    'ebcdf8b5-ede5-4737-b6c9-f9a857fee5d3', // @jeff
    'be03853c-6190-4c6f-bdf5-912253d9b90d', // @janakan
    '1015d97f-4078-4cde-80d6-9d14c62a4aef', // @ukris
    '55d1a52e-e665-47e7-a23a-b038cb779d04', // @sonia
  ];
  return authorizedAdmins.includes(getUserId());
};

export default {
  isLoggedIn,
  setHeader,
  getUser,
  logout,
  getUserId,
  getUserSettings,
  isAdmin,
  isLoggedInAsUser,
};
