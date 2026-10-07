import inspect
from functools import wraps

from flask_openapi4 import APIBlueprint
from flask_openapi4.request import _validate_request


class BareDoBlueprint(APIBlueprint):
    """APIBlueprint subclass that ensures JWT authentication runs before parameter validation."""

    @staticmethod
    def create_view_func(
        func,
        header,
        cookie,
        path,
        query,
        form,
        body,
        raw,
        view_class=None,
        view_kwargs=None,
    ):
        @wraps(func)
        def view_func(**kwargs):
            # Check JWT auth first if endpoint is protected with @jwt_required
            cur = func
            while cur:
                if (
                    hasattr(cur, "__code__")
                    and "verify_type" in cur.__code__.co_freevars
                    and cur.__closure__
                ):
                    from flask_jwt_extended.view_decorators import verify_jwt_in_request

                    closure_dict = dict(
                        zip(
                            cur.__code__.co_freevars,
                            [c.cell_contents for c in cur.__closure__],
                            strict=False,
                        )
                    )
                    verify_jwt_in_request(
                        optional=closure_dict.get("optional", False),
                        fresh=closure_dict.get("fresh", False),
                        refresh=closure_dict.get("refresh", False),
                        locations=closure_dict.get("locations", None),
                        verify_type=closure_dict.get("verify_type", True),
                        skip_revocation_check=closure_dict.get("skip_revocation_check", False),
                    )
                    break
                cur = getattr(cur, "__wrapped__", None)

            # Validate request parameters (body, query, path, etc.)
            func_kwargs = _validate_request(
                header=header,
                cookie=cookie,
                path=path,
                query=query,
                form=form,
                body=body,
                raw=raw,
                path_kwargs=kwargs,
            )

            if view_class:
                signature = inspect.signature(view_class.__init__)
                parameters = signature.parameters
                if parameters.get("view_kwargs"):
                    view_object = view_class(view_kwargs=view_kwargs)
                else:
                    view_object = view_class()
                return func(view_object, **func_kwargs)
            return func(**func_kwargs)

        if not hasattr(func, "view"):
            func.view = view_func
        return func.view
