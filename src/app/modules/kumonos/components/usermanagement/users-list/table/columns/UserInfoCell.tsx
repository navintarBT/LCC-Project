
import { FC } from "react";

type Props = {
  user?: string;
};

const UserInfoCell: FC<Props> = ({ user }) => (
  <p className="text-gray-800 mb-1">{user}</p>
);

export { UserInfoCell };
