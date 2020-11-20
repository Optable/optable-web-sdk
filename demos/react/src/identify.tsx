import React, { useContext, createContext, useState } from "react";
import ReactDOM from "react-dom";
import OptableSDK, { OptableConfig } from "@optable/web-sdk";

const OptableContext = createContext<OptableSDK | null>(null);

// Sandbox configuration injected by webpack based on build environment
declare global {
  const SANDBOX_CONFIG: OptableConfig;
}

// Provide a global SDK instance across the application
// This showcases the usage of context to avoid using a global or passing down the
// instance as props through all components layers.
//
// Obviously overkill in our case since we only have one component.
function OptableProvider({ children }: { children: React.ReactNode }) {
  const sdk = new OptableSDK(SANDBOX_CONFIG);
  return <OptableContext.Provider value={sdk}>{children}</OptableContext.Provider>;
}

type RequestDetailsProps = {
  email: string;
  ppid: string;
  response: { error?: string } | null;
};

function RequestDetails({ email, ppid, response }: RequestDetailsProps) {
  return (
    <div>
      {!!email && (
        <>
          <span>
            Email: {email} ({OptableSDK.eid(email)})
          </span>
          <br />
        </>
      )}
      {!!ppid && (
        <>
          <span>
            PPID: {ppid} ({OptableSDK.cid(ppid)})
          </span>
          <br />
        </>
      )}
      {response &&
        (!response.error ? (
          "Sent"
        ) : (
          <>
            Error:
            <br />
            <span>{response.error}</span>
          </>
        ))}
    </div>
  );
}

// The main application, showcasing usage of identify API
function Form() {
  const [emailChecked, setEmailChecked] = useState(true);
  const [ppidChecked, setPPIDChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [ppid, setPPID] = useState("");

  // Represents information about the current/last in flight request
  const [requestDetails, setRequestDetails] = useState<RequestDetailsProps | null>(null);

  // Fetch SDK instance from context
  const sdk = useContext(OptableContext)!;

  const identify = () => {
    const request = {
      email: emailChecked ? email : "",
      ppid: ppidChecked ? ppid : "",
      response: null,
    };

    setRequestDetails(request);

    sdk
      .identify(emailChecked ? OptableSDK.eid(email) : "", ppidChecked ? OptableSDK.cid(ppid) : "")
      .then(() => {
        setRequestDetails({ ...request, response: {} });
      })
      .catch((err) => {
        setRequestDetails({ ...request, response: { error: err.message || "Connection error" } });
      });
  };

  return (
    <>
      <fieldset>
        <div>
          <label htmlFor="email-checked">
            <input
              id="email-checked"
              type="checkbox"
              checked={emailChecked}
              onChange={({ currentTarget: { checked } }) => setEmailChecked(checked)}
            />
            &nbsp;Email Address:
          </label>
          <input
            type="email"
            size={64}
            value={email}
            onChange={({ currentTarget: { value } }) => setEmail(value)}
            disabled={!emailChecked}
          />
        </div>
        <br />
        <div>
          <label htmlFor="ppid-checked">
            <input
              id="ppid-checked"
              type="checkbox"
              checked={ppidChecked}
              onChange={({ currentTarget: { checked } }) => setPPIDChecked(checked)}
            />
            &nbsp;Send PPID:
          </label>
          <input
            type="text"
            size={64}
            value={ppid}
            onChange={({ currentTarget: { value } }) => setPPID(value)}
            disabled={!ppidChecked}
          />
        </div>
        <br />
        <button className="button-primary" onClick={() => identify()}>
          Identify
        </button>
      </fieldset>
      <div className="code-result">{requestDetails && <RequestDetails {...requestDetails} />}</div>
    </>
  );
}

const anchor = document.getElementById("app");
anchor &&
  ReactDOM.render(
    <React.StrictMode>
      <OptableProvider>
        <Form />
      </OptableProvider>
    </React.StrictMode>,
    anchor
  );
