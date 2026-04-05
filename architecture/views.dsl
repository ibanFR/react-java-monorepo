views {

    systemContext authSystem "SystemContext" "System context diagram for the authentication monorepo." {
        include *
        autolayout tb
    }

    container authSystem "Containers" "Container diagram showing the React SPA, Quarkus API, and database." {
        include *
        autolayout tb
    }

    component api "Components" "Component diagram for the Quarkus API." {
        include *
        autolayout tb
    }

    !include styles.dsl

}
