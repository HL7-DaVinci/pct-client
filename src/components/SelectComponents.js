import { Select, MenuItem } from "@mui/material";

export const getPatientDisplayName = (patient) => {
  if (patient === undefined) return null;
  const name = patient.resource.name[0];
  if (name.text != null) return name.text;
  else return `${name.given[0]} ${name.family}`;
};

export const PatientSelect = (
  patients,
  selectPatient,
  handleOpenPatients,
  handleChange
) => {
  return (
    <Select
      required
      labelId="select-patient-label"
      id="patient"
      value={selectPatient}
      onOpen={handleOpenPatients}
      onChange={handleChange}
    >
      {patients ? (
        patients.map((patient) => {
          return (
            <MenuItem key={patient.resource.id} value={patient.resource.id}>
              {getPatientDisplayName(patient)}
            </MenuItem>
          );
        })
      ) : (
        <MenuItem />
      )}
    </Select>
  );
};

export const getPriorityDisplayName = (priority) => {
  if (priority === undefined) return null;

  return priority.resource.priority.coding[0].code;
};
export const PrioritySelect = (
  priorities,
  selectPriority,
  handleOpenPriorities,
  handleChange
) => {
  let priorityList = [];
  return (
    <Select
      required
      labelId="select-priority-label"
      id="priority"
      value={JSON.stringify(selectPriority)}
      onOpen={handleOpenPriorities}
      onChange={handleChange}
    >
      {priorities ? (
        priorities.map((selectedPriority) => {
          //check to see if priority type is already in the priorityList
          if (priorityList.includes(getPriorityDisplayName(selectedPriority))) {
            return null;
          }
          //put the priority into the list if not there yet
          priorityList.push(getPriorityDisplayName(selectedPriority));
          return (
            <MenuItem
              key={selectedPriority.resource.priority}
              value={JSON.stringify(selectedPriority.resource)}
            >
              {getPriorityDisplayName(selectedPriority)}
            </MenuItem>
          );
        })
      ) : (
        <MenuItem />
      )}
    </Select>
  );
};

export const ProfessionalBillingProviderSelect = (
  providers,
  selectedProvider,
  handleSelect,
  id
) => {
  return (
    <Select
      required
      labelId="select-billing-provider-label"
      id="billing-provider"
      value={selectedProvider}
      onChange={handleSelect}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {providers ? (
        providers.map((provider) => {
          //for billing provider field, let only "prov" be options
          if (id === "billingProvider") {
            if (provider.resource.type !== undefined) {
              if (provider.resource.type[0].coding[0].code !== "prov") {
                return undefined;
              }
            }
          }

          //for submitting provider field, let all except payers to be options
          if (id === "submittingProvider") {
            if (provider.resource.type !== undefined) {
              if (provider.resource.type[0].coding[0].code === "pay") {
                return undefined;
              }
            }
          }

          return (
            <MenuItem key={provider.id} value={provider.id}>
              {provider.display}
            </MenuItem>
          );
        })
      ) : (
        <MenuItem />
      )}
    </Select>
  );
};

export const OrganizationSelect = (
  organizations,
  organizationSelected,
  label,
  id,
  handleOpen,
  handleSelect
) => (
  <Select
    required
    labelId={label}
    id={id}
    value={organizationSelected}
    onOpen={handleOpen}
    onChange={handleSelect}
    style={{ backgroundColor: "#FFFFFF" }}
  >
    {organizations ? (
      organizations.map((org) => {
        //for billing provider field, let only "prov" be options
        if (id === "billingProvider") {
          if (org.resource.type[0].coding[0].code !== "prov") {
            return undefined;
          }
        }

        //for submitting provider field, let all except payers to be options
        if (id === "submittingProvider") {
          if (org.resource.type[0].coding[0].code === "pay") {
            return undefined;
          }
        }

        return (
          <MenuItem key={org.resource.id} value={org.resource.id}>
            {org.resource.name}
          </MenuItem>
        );
      })
    ) : (
      <MenuItem />
    )}
  </Select>
);
