/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import {
	doGutenbergNativeSetup,
	initialHtmlGutenberg,
} from '@wordpress/react-native-editor';
import { use } from '@wordpress/data';

/**
 * Internal dependencies
 */
import correctTextFontWeight from './text-font-weight-correct';
import setupJetpackEditor from './jetpack-editor-setup';
import initialHtml from './initial-html';

// Register a Redux middleware to respond to actions originating within
// Gutenberg, e.g. tracking analytic events
use( ( registry ) => ( {
	dispatch: ( namespace ) => {
		const actions = { ...registry.dispatch( namespace ) };
		if ( namespace === 'core/editor' ) {
			const originalUndo = actions.undo;
			actions.undo = ( ...args ) => {
				console.log( '>>> Track UNDO action' );
				return originalUndo( ...args );
			};
		}
		return actions;
	},
} ) );

addAction( 'native.pre-render', 'gutenberg-mobile', () => {
	require( './strings-overrides' );
	correctTextFontWeight();
} );

addAction( 'native.render', 'gutenberg-mobile', ( props ) => {
	setupJetpackEditor(
		props.jetpackState || { blogId: 1, isJetpackActive: true }
	);
} );

addFilter( 'native.block_editor_props', 'gutenberg-mobile', ( editorProps ) => {
	if ( __DEV__ ) {
		let { initialTitle, initialData } = editorProps;

		if ( initialTitle === undefined ) {
			initialTitle = 'Welcome to gutenberg for WP Apps!';
		}

		if ( initialData === undefined ) {
			initialData = initialHtml + initialHtmlGutenberg;
		}

		return {
			...editorProps,
			initialTitle,
			initialData,
		};
	}
	return editorProps;
} );

doGutenbergNativeSetup();
