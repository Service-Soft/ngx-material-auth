import { FooterRow, NavbarRow } from 'ngx-material-navigation';

export const navbarRows: NavbarRow[] = [
    {
        elements: [
            {
                type: 'internalLink',
                route: '',
                icon: 'fas fa-home',
                name: 'Home',
                collapse: 'never'
            },
            {
                type: 'internalLink',
                route: 'login',
                icon: 'fas fa-user',
                name: 'Login',
                collapse: 'sm'
            },
            {
                type: 'menu',
                icon: 'fas fa-lock',
                name: 'Restricted Routes',
                collapse: 'sm',
                elements: [
                    {
                        type: 'internalLink',
                        name: 'Logged In Guard',
                        route: 'guards/logged-in'
                    },
                    {
                        type: 'internalLink',
                        name: 'Role Guard',
                        route: 'guards/role'
                    },
                    {
                        type: 'internalLink',
                        name: 'Belongs To Guard',
                        route: 'guards/belongs-to'
                    }
                ]
            },
            {
                type: 'internalLink',
                route: 'interceptors',
                name: 'Interceptors',
                collapse: 'sm'
            }
        ]
    }
];

export const footerRows: FooterRow[] = [
    {
        elements: [
            {
                type: 'title',
                title: 'NGX-MATERIAL-AUTH',
                position: 'center'
            }
        ]
    }
];