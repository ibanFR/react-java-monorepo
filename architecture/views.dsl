views {

    systemContext authSystem "SystemContext" "System context diagram for the authentication monorepo." {
        include *
        autolayout lr
    }

    container authSystem "Containers" "Container diagram showing the React SPA, Quarkus API, and database." {
        include *
        autolayout lr
    }

    component api "Components" "Component diagram for the Quarkus API." {
        include *
        autolayout lr
    }

}
