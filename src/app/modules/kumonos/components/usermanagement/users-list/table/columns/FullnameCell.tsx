import { FC } from "react";

type Props = {
  fullname?: string;
};

const FullnameCell: FC<Props> = ({ fullname }) => (
  <div className="text-gray-800 mb-1">{fullname}</div>
);

export { FullnameCell };
