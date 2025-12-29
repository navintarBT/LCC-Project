import { FC } from "react";

type Props = {
  last_name?: string;
};

const LastNameCell: FC<Props> = ({ last_name }) => (
  <div className="text-gray-800 mb-1">{last_name}</div>
);

export { LastNameCell };