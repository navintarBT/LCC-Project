import { FC } from "react";

type Props = {
    email?: string;
};

const UserEmailCell: FC<Props> = ({ email }) => (
  <div className="text-gray-800 mb-1">{email}</div>
);

export { UserEmailCell };
