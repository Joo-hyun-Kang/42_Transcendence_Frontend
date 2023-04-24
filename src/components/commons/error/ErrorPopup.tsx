import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import { isErrorOnGet } from '../../../recoil/globals/atoms/atom';

const Popup = styled.div`
  position: fixed;
  width: 40vh;
  height: 20vh;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 15px;
`;

interface ErrorPopupProps {
  message: string;
}

function ErrorPopup({ message }: ErrorPopupProps) {
  const [isErrorGet, setIsErrorGet] = useRecoilState(isErrorOnGet);
  return (
    <div>
      {isErrorGet && (
        <Popup>
          <p>{message}</p>
        </Popup>
      )}
    </div>
  );
}

export default ErrorPopup;