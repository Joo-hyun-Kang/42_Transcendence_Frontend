import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { To, useNavigate, Link } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { isExpired } from 'react-jwt';
import { userState } from '../../../../recoil/locals/login/atoms/atom';
import { NError } from '../../chat/chatroom-page';
import AcceptGameModal from '../../game/game-modal/accept-game-modal/AcceptModal';
import { getImageUrl } from '../../../../api/ProfileImge';
import LoginSocketContext from './LoginSocketContext';
import ErrorPopupNav from '../../../commons/error/ErrorPopupNav';
import ParseUuid from '../../ParseUuid';

interface Props {
  children: ReactNode;
}

export interface User {
  userId: string;
  nickname: string;
  status: string;
  email: string;
  image: string;
  intraId: string;
  phoneNumber: string | null;
}

export default function CheckLogin({ children }: Props) {
  const navigate = useNavigate();
  const userInfo = useRecoilValue(userState);
  const setUserState = useSetRecoilState(userState);
  const socketRef = useRef<Socket | null>(null);
  // 에러
  const [isErrorGet, setIsErrorGet] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [moveTo, setMoveTo] = useState<To>(``);
  const handleHideErrorModal = () => {
    setIsErrorGet(false);
  };

  useEffect(() => {
    if (userInfo.token !== '' && isExpired(userInfo.token) === true) {
      const resetUser = {
        token: '',
        userId: '',
        nickname: '',
        imageUrl: '',
      };
      setUserState(resetUser);
      socketRef.current?.close();
      setIsErrorGet(true);
      setMoveTo(`/`);
      setErrorMessage('만료되었습니다. 다시 로그인해 주세요.');
    }
  });

  useEffect(() => {
    if (userInfo.token === '') {
      socketRef.current?.close();
      navigate('/');
      return;
    }
    if (userInfo.token !== '' && socketRef.current === null) {
      socketRef.current = io(`${process.env.REACT_APP_BASE_BACKEND_URL}`, {
        path: '/socket.io',
        extraHeaders: {
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      socketRef.current.emit('login');
      socketRef.current.on('error', (error: NError) => {
        const resetUser = {
          token: '',
          userId: '',
          nickname: '',
          imageUrl: '',
        };
        setUserState(resetUser);
        navigate('/');
      });
    }
  }, []);

  const [enemyInfo, setEnemyInfo] = useState<User | null>(null);

  // 게임 초대 이벤트 모니터링 -> 감지시 게임 초대 수락 모달 띄움
  useEffect(() => {
    // 게임 초대를 받음
    socketRef.current?.once('inviteGame', async (user: User) => {
      console.log('게임 초대 받음');
      const imageUrl = await getImageUrl(user.userId, userInfo.token);
      setEnemyInfo({
        ...user,
        image: imageUrl,
      });
      setIsOpenAcceptGameModal(true);
    });

    socketRef.current?.once('gameError', (message: { message: string }) => {
      setIsOpenAcceptGameModal(false);
      setIsOpenAcceptWaitingModal(false);
    });

    return () => {
      socketRef.current?.off('inviteGame');
      socketRef.current?.off('gameError');
    };
  });

  // 게임 초대 수락 모달
  const [isOpenAcceptGameModal, setIsOpenAcceptGameModal] =
    useState<boolean>(false);
  const handleClickAcceptModal = () => {
    setIsOpenAcceptGameModal(!isOpenAcceptGameModal);
  };

  // 초대 수락 대기 모달
  const [isOpenAcceptWaitingModal, setIsOpenAcceptWaitingModal] =
    useState<boolean>(false);
  const onCloseWaitingModal = () => {
    setIsOpenAcceptWaitingModal(false);
  };

  return (
    <>
      <ErrorPopupNav
        isErrorGet={isErrorGet}
        message={errorMessage}
        handleErrorClose={handleHideErrorModal}
        moveTo={moveTo}
      />
      {!isErrorGet && (
        <LoginSocketContext.Provider value={socketRef.current}>
          {isOpenAcceptGameModal && enemyInfo && (
            <AcceptGameModal
              enemyInfo={enemyInfo}
              handleClickModal={handleClickAcceptModal}
              socketRef={socketRef}
            />
          )}
          <ParseUuid>{children}</ParseUuid>
        </LoginSocketContext.Provider>
      )}
    </>
  );
}
