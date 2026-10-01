import React from "react";

const FieldError = ({message}) => message
    ? <p className="text-sm font-medium text-destructive">{message}</p>
    : null

export default FieldError
