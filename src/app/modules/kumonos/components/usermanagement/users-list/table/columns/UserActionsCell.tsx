import { FC, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { MenuComponent } from "../../../../../../../../_metronic/assets/ts/components";
import { ID, KTIcon, QUERIES } from "../../../../../../../../_metronic/helpers";
import { useQueryResponse } from "../../core/QueryResponseProvider";
import { deleteUser } from "../../core/_requests";
import { useListView } from "../../core/ListViewProvider";
import { useAuth } from "../../../../../../../modules/auth/core/Auth"
import Swal from "sweetalert2";

type Props = {
  id: ID;
};

const UserActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView();
  const { currentUser } = useAuth();
  const { query } = useQueryResponse();
  const queryClient = useQueryClient();
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (id !== currentUser?._id && currentUser?.role === "normal_user") {
      setIsDisabled(true)
    }
  }, [currentUser])

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  const getUserID = (_uid:any) => {
    // console.log(_uid);
  }

  const delete_user = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then( async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        await deleteItem.mutateAsync()
        Swal.fire("Deleted successfully!", "", "success");
      }
    });
  }

  const deleteItem = useMutation(() => deleteUser(id), {    
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: () => {
      // ✅ update detail view directly
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`]);
    },
  });

  return (
    <>
      <a
        href="#"
        className="btn btn-light btn-active-light-primary btn-sm w-100px"
        data-kt-menu-trigger={isDisabled ? 'disabled' : 'click'}
        data-kt-menu-placement="bottom-end"
        // style={isDisabled ? { background : "#dce5fc", color : "#1e7abd"} : {}}
      >
        Actions
        <KTIcon iconName="down" className="fs-5 m-0" />
      </a>
      {/* begin::Menu */}
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4"
        data-kt-menu="true"
      >
        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={openEditModal} >
            Edit  
          </a> 
        </div>

        {/* begin::Menu item */}
        {currentUser?.role !== "normal_user" && (
          <div className="menu-item px-3">
            <a
              className="menu-link px-3"
              data-kt-users-table-filter="delete_row"
              onClick={async () => await delete_user()}
            >
              Delete
            </a>
          </div>
        )}
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  );
};

export { UserActionsCell };
